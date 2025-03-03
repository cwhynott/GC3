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

        spectrogram_id = fs.put(buf.getvalue(), filename=f"{cfile.filename}_spectrogram.png")

        print(f"Spectrogram saved to GridFS with ID: {spectrogram_id}")

        return jsonify({'spectrogram': encoded_img, 'csv_id': str(file_id), 'message': 'CSV saved and spectrogram generated successfully'})

    @app.route('/save', methods=['POST'])
    def save_file():
        """
        Saves all related files (CSV, spectrogram, metadata, and FileData) in MongoDB under the original cfile name.
        @return JSON response containing a success message and file ID.
        """
        if 'csv_id' not in request.json or 'spectrogram_id' not in request.json or 'metadata' not in request.json or 'filedata' not in request.json:
            return jsonify({'error': 'CSV ID, Spectrogram ID, Metadata, and FileData are required'}), 400

        csv_id = request.json['csv_id']
        spectrogram_id = request.json['spectrogram_id']
        metadata = request.json['metadata']  # Metadata in JSON format
        filedata = request.json['filedata']  # Serialized FileData object in JSON format

        try:
            # Retrieve CSV file from GridFS to extract the original filename
            csv_file = fs.get(ObjectId(csv_id))
            original_name = csv_file.filename.split(".")[0]  # Extract base name

            # Combine everything into a single database document
            file_entry = {
                "filename": original_name,
                "csv_id": csv_id,
                "spectrogram_id": spectrogram_id,
                "metadata": metadata,
                "filedata": filedata  # Store FileData object
            }

            # Insert into MongoDB as a document
            saved_file_id = db.file_records.insert_one(file_entry).inserted_id

            print(f"File '{original_name}' saved with ID {saved_file_id}")

            return jsonify({'message': 'All related files saved successfully', 'file_id': str(saved_file_id)})

        except Exception as e:
            print("Error saving files:", e)
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
        Retrieves a spectrogram from GridFS and returns it as a base64 encoded image.
        @param file_id: the ID of the spectrogram file in the database.
        @return JSON response containing the base64 encoded spectrogram image.
        """
        try:
            # Retrieve the spectrogram PNG file from GridFS
            grid_out = fs.get(ObjectId(file_id))
            spectrogram_content = grid_out.read()

            # Convert to base64 for frontend display
            encoded_img = base64.b64encode(spectrogram_content).decode('utf-8')

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