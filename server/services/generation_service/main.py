from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from utils.output import extract_html_code

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class PromptRequest(BaseModel):
    prompt: str = Field(..., alias="prompt")
    first_turn: bool = Field(..., alias="firstTurn")

    class Config:
        allow_population_by_field_name = True


class PromptResponse(BaseModel):
    html_code: str = Field(..., alias="htmlCode")
    name: str = Field(..., alias="name")

    class Config:
        allow_population_by_field_name = True


# TODO: stream this in the future?
@app.post("/generate-game", response_model=PromptResponse)
async def get_llm_response(request: PromptRequest):
    try:
        # Initialize the LLM (replace 'YOUR_API_KEY' with your actual API key)
        llm = ChatOpenAI(model="gpt-4o")
        prompt_code = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
                        You are a world class video game developer, 
                        you generate ONLY the code for a two player turn-based game in a single HTML file.
                        Make sure that the client is unable to make moves when it is not his turn.

                        Here is some context for where the code you will generate will run:

                        The provided HTML file runs inside of a react i-frame. The exact same code will 
                        be used on two different clients, which play against each other. It requires to
                        have a window event listener which will serve as a way to listen for the other 
                        player's moves (implemented using window.addEventListener). The data sent is a 
                        stringified JSON that encodes two types of events: the corresponding moves for
                        the board, and a simple turn switch event that will be used to flip to the opposite
                        turn on one of the client's machine when the game starts. It will also have a
                        sendMessageToParent function, that will send the encoded move of the current client
                        to the parent component which will then end up on the other player's game. It will
                        utilize the postMessage function of the window.parent. Try to make the game look
                        pretty, adding animations when possible.
                    """,
                ),
                ("human", "{input}"),
            ]
        )
        prompt_name = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You generate the appropriate name for the game given by the prompt. Output only the name, and nothing else. No useless talking.",
                ),
                ("human", "{input}"),
            ]
        )

        chain_code = prompt_code | llm | StrOutputParser()
        chain_name = prompt_name | llm | StrOutputParser()
        raw_code = chain_code.invoke({"input": request.prompt})
        name = chain_name.invoke({"input": request.prompt})
        print(raw_code)
        response = extract_html_code(raw_code)

        return PromptResponse(htmlCode=response, name=name)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# You can run the server with: uvicorn your_file_name:app --reload
