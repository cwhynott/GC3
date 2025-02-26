import json
import Annotation

class SigMF():
    """
        Description: Initializes SigMF object
        :param sigmf_file: the sigmf metadata file to be parsed
    """
    def __init__(self, sigmf_file):
        sigmf = sigmf_file.read()
        data = json.loads(sigmf)

        self.datatype = data['global'].get('core:datatype')
        self.sample_rate = data['global'].get('core:sample_rate')
        self.author = data['global'].get('core:author')
        self.hardware = data['global'].get('core:hw')
        self.offset = data['global'].get('core:offset')
        self.recorder = data['global'].get('core:recorder')


        self.datetime = data['captures'][0].get('core:datetime')
        self.center_frequency = data['captures'][0].get('core:frequency')
        self.sample_start = data['captures'][0].get('core:sample_start')

        self.annotations = []

        for annotation in data['annotations']:
            sample_start = annotation.get('sample_start')
            sample_count = annotation.get('sample_count')
            freq_lower = annotation.get('freq_lower_edge')
            freq_upper = annotation.get('freq_upper_edge')
            label = annotation.get('label')
            comment = annotation.get('comment')
            Annotation(sample_start, sample_count, freq_lower, freq_upper, label, comment)

def main():
    filename = "qpsk_in_noise.sigmf-meta"
    f = open(filename,)
    sig = SigMF(f)
    print(sig)


if __name__ == "__main__":
    main()