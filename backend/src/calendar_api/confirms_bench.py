# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"
import json
import openai
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import time
import pandas as pd
from .confirmation import evaluate_event
from .supabase_client import client
from .embeddings import generate_embeddings

load_dotenv()

client_llm = openai.OpenAI(
    api_key = "fu.so@northeastern.edu:03712",
    base_url = "https://nerc.guha-anderson.com/v1")

model = SentenceTransformer('all-MiniLM-L6-v2')

with open('../bench_data/confirm_bench.json', 'r') as file:
  benchmark = json.load(file)

with open('../bench_data/user_ids.json', 'r') as file:
  user_info = json.load(file)

def confirm_event(user_query):
    user_id = user_query["user_id"]
    calendar_id = user_query["calendar_id"]
    event = user_query["event"]

    # 1. Get the most recent rule for the calendar
    rules_result = client.table("rules").select("*").eq("calendar_id", calendar_id).order("version", desc=True).limit(1).execute()
    
    if not rules_result.data:
        raise Exception('NO RULES FOUND')

    rule = rules_result.data[0]
    rules_text = rule["rules_text"]
    rules_embedding = rule["rules_embedding"]
    rule_id = rule["id"]

    # 2. Generate embedding for the incoming event
    event_embedding = generate_embeddings(json.dumps(event))

    # 3. Run evaluation logic
    try:
        result = evaluate_event(
            event=event,
            rules_embedding=rules_embedding,
            event_embedding=event_embedding,
            current_rule_id=rule_id,
            current_rule_text=rules_text
        )
        print(result)
        decision =  "accept" if result["decision"] else "reject"
        return decision

    except Exception as e:
        return e
    
def eval_benchmark():
  output = []
  for item in benchmark['calendar_decisions']:
    username = item['username']
    userid = user_info['userid'][username]
    calendarid = user_info['calendar_id'][username]

    decision_map = {d['event_id']: d['decision'] for d in item['decisions']}

    for ev in item['events']:
       row = {}
       new_event = {}
       new_event["username"] = username
       new_event["user_id"] = userid
       new_event['calendar_id'] = calendarid
       new_event["event"] = ev
       new_event["event_id"] = ev['id']
       row['expected_decision'] = decision_map[new_event["event_id"]]

       start_time = time.perf_counter()
       gen_decision = confirm_event(new_event)
       print(gen_decision)
       row['generated_decision'] = gen_decision #"accept" if gen_decision == "is_accepted" else "reject"
       end_time = time.perf_counter()
       execution_time = end_time - start_time
       row['generation_time_elapsed'] = execution_time
       row['match'] = 1 if row['expected_decision'] == row['generated_decision'] else 0
       output.append(row)
  output_df = pd.DataFrame(output)
  return output_df

def evaluate():
  results_df = eval_benchmark()
  results_df.to_csv('../bench_data/confirms_bench_results.csv', index=False)
  print("Benchmark evaluation complete. Results saved to confirms_bench_results.csv.")
  



    