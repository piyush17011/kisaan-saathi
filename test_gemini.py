import google.generativeai as genai

genai.configure(api_key="AIzaSyBtX9SYp2eG0TLj1m_e2n9HgVNGRWDPDKY")

model = genai.GenerativeModel("gemini-2.5-flash-lite")

response = model.generate_content("Say hello")

print(response.text)