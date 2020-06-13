# -*- coding: utf-8 -*-
"""
Created on Mon Apr 13 14:08:29 2020

@author: Brownie
"""

import pandas as pd
import sys
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

if not firebase_admin._apps:
  # Use a service account
  cred = credentials.Certificate('./bibviz-firebase-adminsdk-1mj6d-d606f24212.json')
  # cred = credentials.Certificate('/content/drive/My Drive/Auth/bibviz-firebase-adminsdk-1mj6d-d606f24212.json')
  firebase_admin.initialize_app(cred)

db = firestore.client()

data = pd.read_csv('./AuthorXContentXReserve2.txt', sep='\t') 
# data_650 = data[(data['MARC'] == 650) & (data['varfield_view.marc_tag'] == 710)]

no_data = data.shape[0]
start = 0

print('Processing Data ...')

for i, row in data.iloc[start:].iterrows():
  book_id, lang_code, country_code, marc_tag, author, content, marc, checkout, renew, copy, internal = row
  try: 
    author = author.split('|a')[-1].split('|')[0]
    author = author[:-1] if author[-1] == ',' else author
    content = content.split('|a')[-1].split('|')[0]
    content = content[:-1] if content[-1] == ',' else content
  except: 
    print('\nerror author:{:}, content: {:}'.format(author, content))
  finally: 
    doc_data = { 
      'marc': {
          str(marc): content
      },
      'marc_tag': {
          str(marc_tag): author
      },
      'lang_code': lang_code,
      'country_code': country_code, 
      'checkout': checkout, 
      'renew': renew, 
      'copy': copy, 
      'internal': internal
    } 

    doc_ref = db.collection('AuthorXContentXReserve').document(str(book_id)) 

    if doc_ref.get().exists :
      doc_ref.update(doc_data)
    else:  
      doc_ref.set(doc_data)

    sys.stdout.write('\r ...processing {:} / {:} rows.'.format(i + 1, no_data))

print('Finished Process Data.') 
