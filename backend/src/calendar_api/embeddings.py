from sentence_transformers import SentenceTransformer
import numpy as np


model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embeddings(text:str, vector_length = 384):
  embeddings = model.encode(text)
  if len(embeddings) < vector_length:
    embeddings = pad_with_tokens(embeddings, vector_length)
  elif len(embeddings) > vector_length:
    embeddings = truncate(embeddings, vector_length)
  
  return embeddings.tolist()

def pad_with_tokens(embeddings, vector_length):
  return np.pad(embeddings, (0, vector_length - len(embeddings)), mode='constant', constant_values=0)

def truncate(embeddings, vector_length):
  return embeddings[:vector_length]

  