# app.py
from __future__ import division, print_function
import os
import requests
import numpy as np
from PIL import Image
from flask import Flask, url_for, request, render_template, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from heatmap import save_and_display_gradcam, make_gradcam_heatmap
import scipy.ndimage

# More lenient QC thresholds for mobile uploads
THRESHOLDS = {
    'blur': 50,             # Laplacian variance; lower = more lenient
    'contrast': 10,         # std of pixel intensity; lower = more lenient
    'brightness_min': 50,   # mean intensity (wider range)
    'brightness_max': 200,  
    'noise': 100,           # high-frequency variance; higher = more lenient
    'rotation_max': 10      # degrees deviation tolerated for orientation
}
# Flask app
app = Flask(__name__, static_url_path='')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['HEATMAP_FOLDER'] = 'heatmap'

# Create folders if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['HEATMAP_FOLDER'], exist_ok=True)

# Node.js Backend API URLs
# Node.js Backend API URLs
WEBSITE_API_URL = "https://fypfinalwebapp.onrender.com/api"
APP_API_URL = "https://fypfinalwebapp.onrender.com/api/cases"


MODEL_PATH = 'models/mobileNetV2.keras'

# Load model
from tensorflow.keras.models import load_model
model = load_model(MODEL_PATH)
print("Model loaded. Start serving...")

class_dict = {0: "Normal", 1: "Pneumonia", 2: "TB"}

# ---------------- QC FUNCTIONS ----------------
def qc_checks(img_path):
    """Run stricter QC checks for medical safety without cv2."""
    results = {}
    img = Image.open(img_path)
    img_gray = img.convert('L')
    img_array = np.array(img_gray, dtype=np.float32)

    # 1. Resolution
    results['resolution'] = img.width >= 224 and img.height >= 224

    # 2. Blur detection (variance of Laplacian using scipy)
    lap = scipy.ndimage.laplace(img_array).var()
    results['blur'] = lap >= THRESHOLDS['blur']

    # 3. Contrast check (std deviation of pixel intensities)
    results['contrast'] = np.std(img_array) >= THRESHOLDS['contrast']

    # 4. Brightness / Exposure
    mean_val = np.mean(img_array)
    results['brightness'] = THRESHOLDS['brightness_min'] <= mean_val <= THRESHOLDS['brightness_max']

    # 5. Noise detection (high-frequency variance)
    hf = img_array - scipy.ndimage.gaussian_filter(img_array, sigma=1)
    results['noise'] = np.var(hf) <= THRESHOLDS['noise']

    # 6. Orientation check
    results['orientation'] = img.width >= img.height  # standard orientation

    # 7. Overall QC
    results['qc_pass'] = all(results.values())
    
    # Convert numpy bools to Python bools for JSON serialization
    for key in results:
        if isinstance(results[key], (np.bool_, np.generic)):
            results[key] = bool(results[key])
    
    return results

# ---------------- MODEL PREDICTION ----------------
def model_predict(img_path, model):
    img = Image.open(img_path).convert('RGB').resize((224, 224))
    img_arr = np.array(img).astype('float32') / 255
    img_arr = np.expand_dims(img_arr, axis=0)
    preds = model.predict(img_arr)[0]
    prediction = sorted([(class_dict[i], round(j * 100, 2)) for i, j in enumerate(preds)],
                        reverse=True, key=lambda x: x[1])
    return prediction, img_arr

# ---------------- ROUTES ----------------
@app.route('/uploads/<filename>')
def upload_img(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return "No file uploaded", 400
    f = request.files['file']
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename))
    f.save(file_path)

    # Run QC checks
    qc_results = qc_checks(file_path)
    qc_fail = not qc_results['qc_pass']

    if qc_fail:
        return render_template('predict.html', file_name=f.filename,
                               qc_fail=True, qc_results=qc_results)

    # Model prediction
    pred, img_arr = model_predict(file_path, model)

    # Grad-CAM
    last_conv_layer_name = "block_16_depthwise"
    heatmap = make_gradcam_heatmap(img_arr, model, last_conv_layer_name)
    fname = save_and_display_gradcam(file_path, heatmap)

    return render_template('predict.html', file_name=f.filename,
                           qc_fail=False, result=pred, heatmap_file=fname,
                           qc_results=qc_results)

@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "message": "No file uploaded"
            }), 400

        f = request.files['file']
        filename = secure_filename(f.filename)

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        f.save(file_path)

        print(f"[API] File received: {filename}, size: {os.path.getsize(file_path)} bytes")

        # Run QC checks
        qc_results = qc_checks(file_path)

        if not qc_results['qc_pass']:
            print(f"[API] QC Failed: {qc_results}")
            return jsonify({
                "success": False,
                "qc_pass": False,
                "qc_results": qc_results,
                "message": "Image failed quality checks"
            }), 200

        print("[API] QC Passed, running model prediction...")
        
        # Model prediction
        pred, img_arr = model_predict(file_path, model)

        print("[API] Prediction complete, generating heatmap...")
        
        # Grad-CAM
        last_conv_layer_name = "block_16_depthwise"
        heatmap = make_gradcam_heatmap(img_arr, model, last_conv_layer_name)
        heatmap_file = save_and_display_gradcam(file_path, heatmap)
        
        print(f"[API] Heatmap saved as: {heatmap_file}")
        
        # Verify heatmap file exists
        heatmap_path = os.path.join(app.config['HEATMAP_FOLDER'], heatmap_file)
        if not os.path.exists(heatmap_path):
            print(f"[API] WARNING: Heatmap file not found at {heatmap_path}")
            heatmap_file = ""  # Set empty if not found

        # Format prediction nicely - convert numpy types to Python types
        prediction_result = [
            {"label": str(label), "confidence": float(confidence)}
            for label, confidence in pred
        ]

        print(f"[API] Success! Prediction: {prediction_result[0]}")

        return jsonify({
            "success": True,
            "qc_pass": True,
            "qc_results": qc_results,
            "prediction": prediction_result,
            "heatmap": heatmap_file
        }), 200

    except Exception as e:
        print(f"[API] ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/heatmap/<filename>')
def get_heatmap(filename):
    """Serve heatmap files for download"""
    return send_from_directory(app.config['HEATMAP_FOLDER'], filename)

# ---------------- CASES DASHBOARD ROUTES ----------------
@app.route('/cases')
def view_cases():
    """Display all cases with AI results from App Backend (port 5000)"""
    try:
        response = requests.get(f"{APP_API_URL}/all", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            cases = data.get('cases', [])
            
            print(f"[CASES] Fetched {len(cases)} cases from API")
            
            # Format cases for template
            for case in cases:
                # Convert _id to string
                if '_id' in case:
                    case['_id'] = str(case['_id'])
                
                # Handle aiResult
                if 'aiResult' in case and case['aiResult']:
                    case['ai_data'] = case['aiResult']
                    if '_id' in case['aiResult']:
                        case['aiResult'] = str(case['aiResult']['_id'])
            
            print(f"[CASES] Rendering template with {len(cases)} cases")
            return render_template('cases.html', cases=cases)
        else:
            print(f"[CASES] Error fetching cases: Status {response.status_code}")
            return render_template('cases.html', cases=[])
            
    except Exception as e:
        print(f"[CASES] Error fetching cases: {e}")
        import traceback
        traceback.print_exc()
        return render_template('cases.html', cases=[])

@app.route('/case/<case_id>')
def view_case_detail(case_id):
    """View detailed case information from App Backend (port 5000)"""
    try:
        response = requests.get(f"{APP_API_URL}/detail/{case_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            case = data.get('case', {})
            
            case['_id'] = str(case['_id'])
            if case.get('aiResult'):
                case['ai_data'] = case['aiResult']
            
            return render_template('case_detail.html', case=case)
        else:
            return "Case not found", 404
            
    except Exception as e:
        print(f"Error fetching case detail: {e}")
        return f"Error loading case: {str(e)}", 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host="0.0.0.0", port=port)