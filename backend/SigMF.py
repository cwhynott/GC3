"""
 CS-410: SigMF class that stores sigmf metadata info
 @file SigMF.py
 @authors Jun Cho, Will Cho, Grace Johnson, Connor Whynott
 @collaborators None
"""

import json
import Annotation

class SigMF():
    
    def __init__(self, sigmf_file):
        """
            Description: Initializes SigMF object
            :param sigmf_file: the sigmf metadata file to be parsed
        """
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
            self.annotations.append(Annotation(sample_start, sample_count, freq_lower, freq_upper, label, comment))
