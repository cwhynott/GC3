import SigMF

# class that stores file level data pertaining to a raw iq file
class FileData():
    def __init__(self, raw_data_filename, fft, sigmf):
        """
            Description: Initializes FileData object.
            :param raw_data_filename: filename of uploaded iq data file
            :param sigmf:  
            :param fft: set FFT value of associated spectrogram
        """

        file_basename = raw_data_filename.split(".")[0]

        self.raw_data_filename = raw_data_filename
        self.csv_filename = f"{file_basename}.csv"
        self.spectrogram_filename = f"{file_basename}_spectrogram.csv"
        self.iq_plot_filename = f"{file_basename}_iq_plot.csv"
        self.time_domain_filename = f"{file_basename}_time_domain.csv"
        self.freq_domain_filename = f"{file_basename}_freq_domain.csv"
        self.sigmf = sigmf
        self.fft = fft
