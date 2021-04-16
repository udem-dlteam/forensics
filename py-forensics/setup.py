#!/usr/bin/env python3

from distutils.core import setup

setup(name='forensics',
      version='0.1',
      description='Forensics tracks the performance of systems throughout their evolution and allows comparing different systems',
      author='udem-dlteam',
      url='https://github.com/udem-dlteam/forensics',
      packages=['forensics'],
      install_requires=[
          'pandas',
          'pony',
          'flask',
          'flask-restful',
          'flask-cors',
          'flask-caching',
          'gunicorn',
      ]
)
