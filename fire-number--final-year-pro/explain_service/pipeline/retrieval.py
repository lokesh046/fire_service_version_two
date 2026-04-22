from .vectordb import collection
from .embedder import embed_text
from typing import Tuple, List

def retrieve(query: str, top_k: int = 3) -> Tuple[str, List[str], float]:

    query_embedding = embed_text([query])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    context = "\n\n".join(documents)

    sources = list(set([meta["source"] for meta in metadatas]))

    # Convert distance to similarity confidence
    # Lower distance = higher similarity
    if len(distances) == 0:
        avg_distance = 0.0
    else:
        avg_distance = sum(distances) / len(distances)

    confidence = round(max(0, 1 - avg_distance) * 100, 2)

    return context, sources, confidence


