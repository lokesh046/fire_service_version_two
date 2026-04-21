import sys
sys.path.append('.')
from explain_service.pipeline.retrieval import retrieve
from explain_service.pipeline.prompt_builder import build_qa_prompt

query = "explain me about the fire number"
print(f"Query: {query}")

try:
    context, sources, conf = retrieve(query, top_k=3)
    print("--- SOURCES ---")
    print(sources)
    print("--- CONFIDENCE ---")
    print(conf)
    print("--- CONTEXT LENGTH ---")
    print(len(context))
    print("--- CONTEXT SNIPPET ---")
    print(context[:1000])

    print("--- PROMPT ---")
    prompt = build_qa_prompt(context, query)
    print(prompt[:1000])

except Exception as e:
    print("Error:", e)
