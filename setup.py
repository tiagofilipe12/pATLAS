from setuptools import setup

import patlas

VERSION = patlas.__version__

setup(
    name="patlas",
    version=VERSION,
    packages=[
        "patlas",
        "patlas.db_manager",
        "patlas.templates",
        "patlas.utils"
    ],
    install_requires=[
        "Flask>=0.12.2",
        "flask_restful>=0.3.6",
        "flask_sqlalchemy>=2.2",
        "sqlalchemy_migrate>=0.11.0",
        "numpy>=1.13.1",
        "plotly>=2.0.15",
        "SQLAlchemy>=1.2.0b2",
        "tqdm>=4.15.0",
        "psycopg2",
    ],
    description="pATLAS is a program to browse plasmids database and identify"
                " plasmids present within whole genome sequencing data.",
    url="https://github.com/tiagofilipe12/pATLAS",
    author="Tiago F. Jesus",
    author_email="",
    license="GPL3",
    entry_points={
        "console_scripts": [
            "MASHix = patlas.MASHix:main"
        ]
    }
)
