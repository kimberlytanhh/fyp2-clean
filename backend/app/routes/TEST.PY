from openai import OpenAI

client = OpenAI(api_key="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")

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {"role": "user", "content": "Say hello"}
    ]
)

print(response.choices[0].message.content)