"""
 CS-410: FileData class that stores file level information about uploaded data file
 @file FileData.py
 @authors Jun Cho, Will Cho, Grace Johnson, Connor Whynott
 @collaborators None
"""

import SigMF

class FileData():
    def __init__(self, raw_data_filename, fft, sigmf):
        """
            Description: Initializes FileData object.
            :param raw_data_filename: filename of uploaded iq data file
            :param sigmf: SigMF class object created from associated metadata file
            :param fft: set FFT value of associated spectrogram
        """
        file_basename = raw_data_filename.split(".")[0]
        self.raw_data_filename = raw_data_filename
        self.csv_filename = f"{file_basename}.csv"
        self.spectrogram_filename = f"{file_basename}_spectrogram.png"
        self.iq_plot_filename = f"{file_basename}_iq_plot.png"
        self.time_domain_filename = f"{file_basename}_time_domain.png"
        self.freq_domain_filename = f"{file_basename}_freq_domain.png"
        self.sigmf = sigmf
        self.fft = fft
