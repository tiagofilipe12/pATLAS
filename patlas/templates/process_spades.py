#!/usr/bin/env python3

"""
process_spades template for nextflow

Purpose
-------

This module is intended to process the output of SPAdes.

Expected input
--------------
fastq_id: Pair of FastQ file paths.
    .: 'SampleA'
assembly: Fasta file with the assembly from SPAdes.
    .. 'contigs.fasta'
opts: List of options for processing spades assembly.
    1. Minimum contig length
    2. Minimum k-mer coverage

Generated output
----------------
${fastq_id}.assembly.fasta : Fasta files with the filtered assembly
${fastq_id}.report.fasta : CSV file with the results of the filters for each
    contig.

"""


import operator


FASTQ_ID = '$fastq_id'
ASSEMBLY_FILE = '$assembly'
GSIZE = float('$gsize')
OPTS = [x.strip() for x in '$opts'.strip("[]").split(",")]


class Assembly:

    def __init__(self, assembly_file, min_contig_len, min_kmer_cov,
                 sample_id):
        """Class that parses and filters a SPAdes fasta assembly file

        This class parses a SPAdes assembly fasta file, collects a number
        of summary statistics and metadata from the contigs, filters
        contigs based on user-defined metrics and writes filtered assemblies
        and reports.

        Parameters
        ----------
        assembly_file : str
            Path to SPAdes output assembly file.
        min_contig_len : int
            Minimum contig length when applying the initial assembly filter.
        min_kmer_cov : int
            Minimum k-mer coverage when applying the initial assembly.
            filter.
        sample_id : str
            Name of the sample for the current assembly.
        """

        self.contigs = {}
        """
        Dictionary storing data for each contig
        """

        self.filtered_ids = []
        """
        List of filtered contig_ids
        """

        self.min_gc = 0.05
        """
        Sets the minimum GC content on a contig
        """

        self.sample = sample_id
        """
        The name of the sample for the assembly
        """

        self.report = {}
        """
        Will contain the filtering results for each contig
        """

        self.filters = [
            ["length", ">=", min_contig_len],
            ["kmer_cov", ">=", min_kmer_cov]
        ]
        """
        Setting initial filters to check when parsing the assembly file.
        This can be later changed using the 'filter_contigs' method
        """

        # Parse assembly and populate self.contigs
        self._parse_assembly(assembly_file)

        # Perform first contig filtering using min_contig_len, min_kmer_cov,
        # and gc content
        self.filter_contigs(*self.filters)

    def _parse_assembly(self, assembly_file):
        """Parse a SPAdes assembly fasta file

        This is a Fasta parsing method that populates the self.contigs
        attribute with data for each contig in the assembly.

        The insertion of data on the self.contigs is done by the
        self._populate_contigs method, which also calculates GC content and
        proportions.

        Parameters
        ----------
        assembly_file : str
            Path to the assembly fasta file.

        """

        # Temporary storage of sequence data
        seq_temp = []
        # Id counter for contig that will serve as key in self.contigs
        contig_id = 0
        # Initialize kmer coverage and header
        cov, header = None, None

        with open(assembly_file) as fh:

            for line in fh:
                # Skip empty lines
                if not line.strip():
                    continue
                else:
                    # Remove whitespace surrounding line for further processing
                    line = line.strip()

                if line.startswith(">"):
                    # If a sequence has already been populated, save the
                    # previous contig information
                    if seq_temp:
                        # Use join() to convert string list into the full
                        # contig string. This is generally much more efficient
                        # than successively concatenating strings.
                        seq = "".join(seq_temp)

                        self._populate_contigs(contig_id, header, cov, seq)

                        # Reset temporary sequence storage
                        seq_temp = []
                        contig_id += 1

                    header = line[1:]
                    cov = float(line.split("_")[-1])

                else:
                    seq_temp.append(line)

            # Populate last contig entry
            seq = "".join(seq_temp)
            self._populate_contigs(contig_id, header, cov, seq)

    def _populate_contigs(self, contig_id, header, cov, sequence):
        """ Inserts data from a single contig into the self.contigs attribute

        By providing a contig id, the original header, the coverage that
        is parsed from the header and the sequence, this method will
        populate the self.contigs attribute. See the __init__ method for
        details on the contents of the self.contigs dictionary.

        Parameters
        ----------
        contig_id : int
            Arbitrary unique contig identifier.
        header : str
            Original header of the current contig.
        cov : float
            The contig coverage, parsed from the fasta header
        sequence : str
            The complete sequence of the contig.

        Returns
        -------

        """

        # Get AT/GC/N counts and proportions.
        # Note that self._get_gc_content returns a dictionary with the
        # information on the GC/AT/N counts and proportions. This makes it
        # much easier to add to the contigs attribute using the ** notation.
        gc_kwargs = self._get_gc_content(sequence, len(sequence))

        self.contigs[contig_id] = {
            "header": header,
            "sequence": sequence,
            "length": len(sequence),
            "kmer_cov": cov,
            **gc_kwargs
        }

    @staticmethod
    def _get_gc_content(sequence, length):
        """Get GC content and proportions

        Parameters
        ----------
        sequence : str
            The complete sequence of the contig.
        length : int
            The length of the sequence contig

        Returns
        -------
        _ : dict
            Dictionary with the at/gc/n counts and proportions

        """

        # Get AT/GC/N counts
        at = sum(map(sequence.count, ["A", "T"]))
        gc = sum(map(sequence.count, ["G", "C"]))
        n = length - (at + gc)

        # Get AT/GC/N proportions
        at_prop = at / length
        gc_prop = gc / length
        n_prop = n / length

        return {"at": at, "gc": gc, "n": n,
                "at_prop": at_prop, "gc_prop": gc_prop, "n_prop": n_prop}

    @staticmethod
    def _test_truth(x, op, y):
        """ Test the truth of a comparisong between x and y using an operator.

        If you want to compare '100 > 200', this method can be called as
        self._test_truth(100, ">", 200).

        Parameters
        ----------
        x : int
            Arbitrary value to compare in the left
        op : str
            Comparison operator
        y : int
            Arbitrary value to compare in the rigth

        Returns
        -------
        _ : bool
            The truthness of the test
        """

        ops = {
            ">": operator.gt,
            "<": operator.lt,
            ">=": operator.ge,
            "<=": operator.le,
        }

        return ops[op](x, y)

    def filter_contigs(self, *comparisons):
        """Filters the contigs of the assembly according to user provided
        comparisons

        The comparisons must be a list of three elements with the
        self.contigs key, operator and test value. For example, to filter
        contigs with a minimum length of 250, a comparison would be:

        self.filter_contigs(["length", ">=", 250])

        The filtered contig ids will be stored in the self.filtered_ids
        list.

        The result of the test for all contigs will be stored in the
        self.report dictionary.

        Parameters
        ----------
        comparisons : list
            List with contig key, operator and value to test.

        """

        # Reset list of filtered ids
        self.filtered_ids = []
        self.report = {}

        gc_filters = [
            ["gc_prop", ">=", self.min_gc],
            ["gc_prop", "<=", 1 - self.min_gc]
        ]

        self.filters = list(comparisons) + gc_filters

        for contig_id, contig in self.contigs.items():
            for key, op, value in list(comparisons) + gc_filters:
                if not self._test_truth(contig[key], op, value):
                    self.filtered_ids.append(contig_id)
                    self.report[contig_id] = "{}/{}/{}".format(key,
                                                               contig[key],
                                                               value)
                    break
                else:
                    self.report[contig_id] = "pass"

    def get_assembly_length(self):
        """Returns the length of the assembly, without the filtered contigs

        Returns
        -------
        _ : int
            Total length of the assembly.

        """

        return sum(
            [vals["length"] for contig_id, vals in self.contigs.items()
             if contig_id not in self.filtered_ids])

    def write_assembly(self, output_file, filtered=True):
        """Writes the assembly to a new file.

        The filtered option controls whether the new assembly will be filtered
        or not.

        Parameters
        ----------
        output_file : str
            Name of the output assembly file.
        filtered : bool
            If True, does not include filtered ids.
        """

        with open(output_file, "w") as fh:

            for contig_id, contig in self.contigs.items():
                if contig_id not in self.filtered_ids and filtered:
                    fh.write(">{}_{}\\n{}\\n".format(self.sample,
                                                     contig["header"],
                                                     contig["sequence"]))

    def write_report(self, output_file):
        """Writes a report with the test results for the current assembly

        Parameters
        ----------
        output_file : str
            Name of the output assembly file.

        """

        with open(output_file, "w") as fh:

            for contig_id, vals in self.report.items():
                fh.write("{}, {}\\n".format(contig_id, vals))


def main():

    min_contig_len, min_kmer_cov = [int(x) for x in OPTS]

    # Parse the spades assembly file and perform the first filtering.
    spades_assembly = Assembly(ASSEMBLY_FILE, min_contig_len, min_kmer_cov,
                               FASTQ_ID)

    # Check if assembly size of the first assembly is lower than 80% of the
    # estimated genome size. If True, perform the filtering without the
    # k-mer coverage filter
    if spades_assembly.get_assembly_length() < GSIZE * 1000000 * 0.8:
        spades_assembly.filter_contigs(*[
            ["length", ">=", min_contig_len]
        ])

    # Write filtered assembly
    output_assembly = "{}.assembly.fasta".format(FASTQ_ID)
    spades_assembly.write_assembly(output_assembly)
    # Write report
    output_report = "{}.report.csv".format(FASTQ_ID)
    spades_assembly.write_report(output_report)


main()
