def extract_html_code(raw: str):
    return raw.split("```")[1][len("html\n") :]
