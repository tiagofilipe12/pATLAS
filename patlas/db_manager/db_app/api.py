from flask_restful import Api

try:
    from db_manager.db_app import app
    from db_manager.db_app.resources import GetSpecies, GetAccession, \
        GetResistances, \
        GetPlasmidFinder, GetAccessionRes, GetAccessionPF, GetPlasmidName, \
        GetAccessionVir, GetVirulence, GetAccessionTaxa, GetAccessionHashes, \
        GetMetal, GetAccessionMetal
except ImportError:
    try:
        from db_app import app
        from db_app.resources import GetSpecies, GetAccession, \
            GetResistances, \
            GetPlasmidFinder, GetAccessionRes, GetAccessionPF, GetPlasmidName, \
            GetAccessionVir, GetVirulence, GetAccessionTaxa, \
            GetAccessionHashes, GetMetal, GetAccessionMetal
    except ImportError:
        from patlas.db_manager.db_app import app
        from patlas.db_manager.db_app.resources import GetSpecies, \
            GetAccession, GetResistances, GetPlasmidFinder, GetAccessionRes, \
            GetAccessionPF, GetPlasmidName, GetAccessionVir, GetVirulence, \
            GetAccessionTaxa, GetAccessionHashes, GetMetal, GetAccessionMetal

## start api
api = Api(app)

## add resources to api upon being called

api.add_resource(GetSpecies, "/api/getspecies/", endpoint="get_species")

api.add_resource(GetPlasmidName, "/api/getplasmidname/", endpoint="get_plasmidname")

api.add_resource(GetResistances, "/api/getresistances/",
                 endpoint="get_resistances")

api.add_resource(GetVirulence, "/api/getvirulence/",
                 endpoint="get_virulence")

api.add_resource(GetMetal, "/api/getmetal/",
                 endpoint="get_metal")

api.add_resource(GetPlasmidFinder, "/api/getplasmidfinder/",
                 endpoint="get_plasmidfinder")

api.add_resource(GetAccession, "/api/getaccession/", endpoint="get_accession")

api.add_resource(GetAccessionRes, "/api/getaccessionres/",
                 endpoint="get_accession_res")

api.add_resource(GetAccessionPF, "/api/getaccessionpf/",
endpoint="get_accessionpf")

api.add_resource(GetAccessionVir, "/api/getaccessionvir/",
endpoint="get_accessionvir")

api.add_resource(GetAccessionMetal, "/api/getaccessionmetal/",
endpoint="get_accessionmetal")

api.add_resource(GetAccessionTaxa, "/api/getaccessiontaxa/",
endpoint="get_accessiontaxa")

api.add_resource(GetAccessionHashes, "/api/getaccessionhash/",
endpoint="get_accessionhash")
