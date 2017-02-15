## Last update: 15/2/2017
## Author: T.F. Jesus
## This is an auxiliary script for MASHix.py, which generates histograms for the lists stored in lists_traces

import os
import plotly
import plotly.graph_objs as go
import numpy

def plot_histogram(lists_traces, output_tag, mother_directory):
	lengths = []
	averages = []
	medians = []
	maximum=[]
	minimum=[]
	## parsing the list to length, average, median, max and min variables
	for trace_list in lists_traces:
		trace_list=[x for x in trace_list if x != 0]
		if trace_list:
			lengths.append(len(trace_list))
			averages.append(numpy.mean(trace_list))
			medians.append(numpy.median(trace_list))
			maximum.append(numpy.max(trace_list))
			minimum.append(numpy.min(trace_list))
	sorted_lengths=sorted(lengths, reverse=True)
	trace_lengths = go.Histogram(x=sorted_lengths, 
								opacity=0.75, 
								name="total number of significant distances within sequence/genome",
								xbins=dict(start=numpy.min(sorted_lengths), 
											size= 2, 
											end= numpy.max(sorted_lengths)))
	trace_averages = go.Histogram(x=averages, 
								opacity=0.75, 
								name="average distances per sequence/genome", 
								marker=dict(color='rgb(174,66,66)'),
								xbins=dict(start=numpy.min(averages), 
											size= 0.01, 
											end= numpy.max(averages)))
	trace_medians = go.Histogram(x=medians, 
								opacity=0.75, 
								name="medians distances per sequence/genome",
								marker=dict(color='rgb(54,95,137)'),
								xbins=dict(start=numpy.min(medians), 
											size= 0.01, 
											end= numpy.max(medians)))

	trace_maximum = go.Histogram(x=maximum, 
								opacity=0.75, 
								name="maximum distances per sequence/genome",
								marker=dict(color='rgb(54,150,137)'),
								xbins=dict(start=numpy.min(maximum), 
											size= 0.01, 
											end= numpy.max(maximum)))

	trace_minimum = go.Histogram(x=minimum, 
								opacity=0.75, 
								name="minimum distances per sequence/genome",
								marker=dict(color='rgb(150,95,137)'),
								xbins=dict(start=numpy.min(minimum), 
											size= 0.01, 
											end= numpy.max(minimum)))
	## ploting
	## first plot
	layout = go.Layout(barmode='overlay', 
					xaxis=dict(
						title='Mash distances'
						),
					yaxis=dict(
						title='Number of sequences/genomes'
						)
					)
	fig = go.Figure(data=[trace_averages,trace_medians,trace_maximum,trace_minimum], layout=layout)
	plot_url = plotly.offline.plot(fig, filename= os.path.join(mother_directory, "results", output_tag + '_avg_med_dist.html'),auto_open=False)
	## second plot
	layout2 = go.Layout(xaxis=dict(
							title='Number of significant <i>(p-value</i> > 0.05) pairwise differences'
							),
						yaxis=dict(
							title='Number of sequences/genomes'
							)
						)
	fig2 = go.Figure(data=[trace_lengths], layout=layout2)
	plot_url = plotly.offline.plot(fig2, filename= os.path.join(mother_directory, "results", output_tag + '_numb_dist.html'),auto_open=False)
