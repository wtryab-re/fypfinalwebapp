

Prerequisites:

Anaconda installed


Step 1: Create a Conda Virtual Environment

Open VS Code terminal.

Create a new environment with Python 3.11.0:

conda create -n nameOfEnviroment python=3.11.0

Activate the environment:

conda activate nameOfEnvironment

Step 2: Install Project Dependencies


After activating the environment run: pip install -r requirements.txt

This will install Flask, TensorFlow, Keras, NumPy, Pillow, and other dependencies in your environment.



Step 3: Run the Application

Make sure the virtual environment is activated:

Run the Flask app with this command: python app.py

click on the link that will appear in terminal 

Upload a chest X-ray image either from test or train folder and see the prediction result.