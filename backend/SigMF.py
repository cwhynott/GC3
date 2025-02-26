import json


class SigMF():

    def __init__(self, sigmf_file):
        sigmf = sigmf_file.read()
        data = json.loads(sigmf)

        try:
            self.datatype = data['global']['datatype']
            self.sample_rate = data['global']['core:sample_rate']
            self.center_frequency = data['captures']['frequency']
            self.sample_start = data['captures']['sample_start']

        except:
            self.sample_rate = 

        # self.sample_rate
        # self.center_frequency
        # self.


def main():
    filename = "qpsk_in_noise.sigmf-meta"
    f = open(filename,)
    sig = SigMF(f)


if __name__ == "__main__":
    main()