# ========================================
# FAQ Generation Prompt
# ========================================

def build_faq_prompt(
    category_data,
    faq_count
):

    return f"""
You are an AI assistant generating FAQs
for a school's knowledge base.

Use ONLY the information provided in the
category content below.

Do not invent information.
Do not make assumptions.
Do not add information that is not present
in the category content.

Generate exactly {faq_count} useful FAQs
that parents or users may ask about this category.

For every FAQ, provide:

- question_en
- question_jp
- answer_en
- answer_jp
- follow_ups

The English and Japanese versions must have
the same meaning.

Each FAQ must follow this exact structure:

{{
    "id": "faq_001",
    "question_en": "...",
    "question_jp": "...",
    "answer_en": "...",
    "answer_jp": "...",
    "follow_ups": [
        "faq_002",
        "faq_003"
    ]
}}

FAQ IDs must start from faq_001 and increase
sequentially.

Generate exactly {faq_count} FAQs.

Do not generate fewer FAQs.
Do not generate more FAQs.

For "follow_ups":

- Select 2 or 3 relevant follow-up FAQ IDs.
- Follow-ups must be directly related to the current FAQ.
- Use ONLY IDs of other generated FAQs.
- Never use the current FAQ's own ID.
- Return a maximum of 3 follow-up IDs.
- Prefer 2 follow-ups when only 2 are clearly relevant.
- Use 3 only when all 3 are genuinely relevant.
- Do not select unrelated FAQs.
- Return an empty array only if there are no relevant
  follow-up FAQs.

Example:

"follow_ups": [
    "faq_002",
    "faq_004"
]

The follow-up IDs must exactly match the IDs
of the generated FAQs.

Return ONLY valid JSON.

Do not use Markdown.
Do not use ```json.
Do not add explanations before or after the JSON.

Category Content:

{category_data}
"""