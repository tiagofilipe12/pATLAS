# Browse

The Browse functions allow the user to explore the plasmid database.
pATLAS uses a curated version of  _refseq_ plasmid database from [NCBI](ftp://ftp.ncbi.nlm.nih.gov/refseq/release/plasmid/)
and establishes the relationships between all plasmids available in the
database through [MASH](http://mash.readthedocs.io/en/latest/) by
estimating the pairwise distances between all plasmids.
For a more detailed explanation on how are these relationships handled
and displayed refer to [Relationships and distances estimations](distances.md)

**Table Of Contents**

* [Browse](browse.md:27#browse)
    * [Distances](#distances)
    * [Length](Browse.md#length)
    * [Size ratio](#size-ratio)
    * [Taxa](Browse.md#taxa)
* [Annotation](Browse.md#annotation)
    * [Plasmid families](#plasmid-families)
    * [Resistances](#resistances)
    * [Virulence](#virulence)
* [Advanced](#advanced)
    * [Multiple](#multiple)



## Browse

### Distances

Distances are represented in **pATLAS** as grey links between nodes (dark grey 
circles). This options allows the user to display how closely related are a 
group of plasmids or a plasmid with another plasmid. It has three color 
schemes options: blue, green and red. You may choose which one you see fit
using a simple dropdown menu.

![](gitbook/images/distancedropdown.png)

The darker the color, the smaller is the distance estimated by MASH and thus
the more closely related (more similar) are the two linked nodes.

![](gitbook/images/distance_result.png)

### Length

You may filter by lenght of the plasmids present in the database. To do 
so, select the **By Length** option under the **Browse** submenu, which
will open a smaller window above the visualization. Then, you may use both 
the slider and the boxes for minimum and maximum limits, which will change the
selected plasmids. Dark grey plasmids are within the current interval whereas
lighter grey plasmids are outside the interval.
 
 ![](gitbook/images/lenght_example.png)


### Size ratio

This option allows users to filter links that have plasmids with very different
sizes. E.g. some plasmids may have a high mash dist (> 0.9) but one of the
plasmids may be a lot smaller than the other. This ratio allows
to specify a percentage between the smaller and the larger plasmid,
connected by a link:

`Size Ratio = 1 - (smaller plasmid length / larger plasmid length)`

The cutoff that the user should provide is the maximum percentage difference 
between the two plasmids. So, if we set it to 30 this will tell pATLAS to 
highlight or remove all the connections that have more than 30% difference 
in size between pairs of plasmids.

### Taxa

In this option you may select a multitude of taxa filters ranging from order
to species. This will highlight with different colors each of the selected
taxa. For instance, if you select _Borreliella afzelii_ and _Borreliella 
garinii_, the plasmids identified in the each of the two species with be
highlighted with different colors.

  ![](gitbook/images/taxa_sample.png)


## Annotation

### Plasmid families

This option allows users to color plasmids present in pATLAS by selecting 
genes available in **PlasmidFinder database**. A dropdown menu with all 
genes present in this database is available for the user to select, and
searches are enabled with a live filter of resulting genes.

Citation:
* [Carattoli, A., Zankari, E., García-Fernández, A.,
Larsen, M. V., Lund, O., Villa, L., Aarestrup, F. M., Hasman, H.
(2014). In Silico detection and typing of plasmids using plasmidfinder and
plasmid multilocus sequence typing. Antimicrobial Agents and Chemotherapy,
58(7), 3895–3903.](https://doi.org/10.1128/AAC.02412-14).

### Resistances

Two resistance genes databases (CARD and Resfinder) are available in pATLAS
and it's possible to highlight plasmids that contain the resistance genes
selected by the user.

Citations:
* [Zankari, E., Hasman, H., Cosentino, S., Vestergaard, M.,
Rasmussen, S., Lund, O., Aarestrup, F. M., Larsen, M. V. (2012).
Identification of acquired antimicrobial resistance genes. Journal of
Antimicrobial Chemotherapy, 67(11), 2640–2644.](https://doi.org/10.1093/jac/dks261)
* [Jia, B., Raphenya, A. R., Alcock, B., Waglechner, N., Guo, P.,
Tsang, K. K.,  Lago B. A., Dave B. M., Pereira S., Sharma A. N.,
Doshi S., Courtot M., Lo R., Williams L. E., Frye J. G., Elsayegh T.,
Sardar D., Westman E. L., Pawlowski A. C., Johnson T. A.,
Brinkman F. S., Wright G. D.,
 McArthur, A. G. (2017). CARD 2017: Expansion and
model-centric curation of the comprehensive antibiotic resistance
database. Nucleic Acids Research, 45(D1), D566–D573.](https://doi.org/10.1093/nar/gkw1004)

### Virulence

The user can highlight plasmids containing virulence genes available in VFDB 
database.

Citation:
* [Chen L, Yang J, Yu J, et al. VFDB: A reference database for
bacterial virulence factors. Nucleic Acids Res. 2005;33(DATABASE ISS.)
:D325-D328. doi:10.1093/nar/gki008.](https://academic.oup.com/nar/article/33/suppl_1/D325/2505203)

## Advanced

It is possible to browse pATLAS through a combination of filters. 


### Multiple

In this menu allows the users to combine different filters between each
of the available levels:

* Taxa,
* Plasmid Families,
* Resistances,
* Virulence.

It is allowed to select multiple entries in one of the dropdown menus for
each level. For instance, you can select _`Straphyloccocus`_ **OR** _`Enterococcus`_
from the genera filter. The selection made within each filter level will
behave as a sum of the selected entries. However, if you select a filter
from another level, for example, `VanA` gene from the CARD filter, pATLAS
selection will behave as an intersection or union of the filters, depending
on which of the following buttons is clicked:

![](gitbook/images/multiple_buttons.png)


The **`Submit intersection`** will make an intersection between two
taxa levels.

<img height="250" width="400" src="gitbook/images/intersection.png" alt="Drawing"/>

In the example above, the resulting visualization will highlight the
plasmids that share in common the selected Taxa **AND** the selected
resistance, marked in purple.

The **`Submit union`** will make an union between each one of the filter levels.

<img height="250" width="400" src="gitbook/images/union.png" alt="Drawing"/>

In the example above, the taxa and resistance selections will be
combined and displayed as a single color.
