"""
CS-410: Generates spectrograms from uploaded files and stores them in MongoDB
@file app.py
@authors Jun Cho, Will Cho, Grace Johnson, Connor Whynott
@collaborators None
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
from pymongo import MongoClient
from bson import ObjectId
from gridfs import GridFS
from SigMF import SigMF
from FileData import FileData
import csv
import os

import matplotlib
# Use the Agg backend for Matplotlib to avoid using any X server
matplotlib.use('Agg')

"""
 * Creates and configures the Flask application.
 * @return The configured Flask application.
"""
def create_app():
    # Initialize the Flask application
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes

    # MongoDB setup using GridFS
    client = MongoClient("mongodb://localhost:27017")
    db = client['files_db']
    fs = GridFS(db)

    @app.route('/upload', methods=['POST'])
    def upload_file():
        """
        Uploads both .cfile and .sigmf-meta files, converts the cfile to CSV, 
        generates a spectrogram, and returns the spectrogram as a base64 encoded image.
        @return JSON response containing the base64 encoded spectrogram image.
        """
        # Ensure both files are in the request
        if 'cfile' not in request.files or 'metaFile' not in request.files:
            return jsonify({'error': 'Both .cfile and .sigmf-meta files are required'}), 400

        cfile = request.files['cfile']
        metafile = request.files['metaFile']

        # Parse the metadata file using SigMF class
        sigmf_metadata = SigMF(metafile)

        # Read and process the .cfile (assuming complex64 format)
        cfile.seek(0)
        iq_data = np.frombuffer(cfile.read(), dtype=np.complex64)

        # Convert complex data into CSV format
        csv_filename = cfile.filename.replace('.cfile', '.csv')
        csv_data = io.StringIO()
        csv_writer = csv.writer(csv_data)
        csv_writer.writerow(["Real", "Imaginary"])
        
        for sample in iq_data:
            csv_writer.writerow([sample.real, sample.imag])

        csv_data.seek(0)  # Reset the pointer

        # Save the CSV file to MongoDB
        file_id = fs.put(csv_data.getvalue().encode(), filename=csv_filename)

        # Initialize FileData object
        file_data = FileData(raw_data_filename=cfile.filename, fft=1024, sigmf=sigmf_metadata)

        print(f"CSV saved to GridFS with ID: {file_id}")

        # Generate spectrogram
        plt.figure()
        Pxx, freqs, bins, im = plt.specgram(iq_data, Fs=sigmf_metadata.sample_rate, Fc=sigmf_metadata.center_frequency, cmap='viridis')
        plt.close()

        # Convert spectrogram to base64 for frontend display
        buf = io.BytesIO()
        plt.imshow(10 * np.log10(Pxx.T), aspect='auto', extent=[freqs[0], freqs[-1], bins[-1], 0], cmap='viridis')
        plt.xlabel("Frequency [Hz]")
        plt.ylabel("Time [s]")
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        encoded_img = base64.b64encode(buf.getvalue()).decode('utf-8')

        print("Spectrogram generated and encoded successfully.")

        return jsonify({'spectrogram': encoded_img, 'csv_id': str(file_id), 'message': 'CSV saved and spectrogram generated successfully'})

    @app.route('/save', methods=['POST'])
    def save_file():
        """
        Saves a CSV file to MongoDB using GridFS.
        @return JSON response containing a success message and the file ID.
        """
        if 'csv_id' not in request.json:
            return jsonify({'error': 'CSV file ID is required'}), 400

        csv_id = request.json['csv_id']

        try:
            grid_out = fs.get(ObjectId(csv_id))
            file_content = grid_out.read()

            # Save CSV file in GridFS as an official record
            saved_file_id = fs.put(file_content, filename=grid_out.filename)

            print(f"CSV '{grid_out.filename}' saved with new ID {saved_file_id}")
            return jsonify({'message': 'CSV file saved successfully', 'file_id': str(saved_file_id)})

        except Exception as e:
            print("Error saving file:", e)
            return jsonify({'error': str(e)}), 500


    @app.route('/files', methods=['GET'])
    def get_files():
        """
        Lists all files saved in GridFS.
        @return JSON response containing a list of files with their IDs and filenames.
        """
        try:
            # List all files saved in GridFS
            files = list(fs.find())
            files_list = [{"_id": str(f._id), "filename": f.filename} for f in files]
            return jsonify({"files": files_list})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/file/<file_id>/spectrogram', methods=['GET'])
    def get_file_spectrogram(file_id):
        """
        Retrieves a CSV file from GridFS, converts it back to complex64, and generates a spectrogram.
        @param file_id: the ID of the file to retrieve.
        @return JSON response containing the base64 encoded spectrogram image.
        """
        try:
            # Retrieve the CSV file from GridFS
            grid_out = fs.get(ObjectId(file_id))
            file_content = grid_out.read().decode()  # Read CSV data

            # Convert CSV back to complex array
            csv_reader = csv.reader(io.StringIO(file_content))
            next(csv_reader)  # Skip header
            iq_data = np.array([complex(float(row[0]), float(row[1])) for row in csv_reader], dtype=np.complex64)

            # Generate spectrogram
            plt.figure()
            Pxx, freqs, bins, im = plt.specgram(iq_data, Fs=8e6, cmap='viridis')
            plt.close()

            # Convert spectrogram to base64 for frontend display
            buf = io.BytesIO()
            plt.imshow(10 * np.log10(Pxx.T), aspect='auto', extent=[freqs[0], freqs[-1], 0, bins[-1]], cmap='viridis')
            plt.xlabel("Frequency [Hz]")
            plt.ylabel("Time [s]")
            plt.savefig(buf, format='png')
            plt.close()
            buf.seek(0)
            encoded_img = base64.b64encode(buf.getvalue()).decode('utf-8')

            return jsonify({'spectrogram': encoded_img})
        except Exception as e:
            return jsonify({'error': str(e)}), 500


    @app.route('/refresh', methods=['POST'])
    def refresh_files():
        """
        Clears all files from GridFS.
        This endpoint can be triggered by a "refresh" button on the client side.
        @return JSON response containing a success message.
        """
        try:
            # Iterate over all files in GridFS and delete each one
            for grid_out in fs.find():
                fs.delete(grid_out._id)
            print("All files have been cleared from the database.")
            return jsonify({'message': 'All files have been cleared from the database.'})
        except Exception as e:
            print("Error clearing files:", e)
            return jsonify({'error': str(e)}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)