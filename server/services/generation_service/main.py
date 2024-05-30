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


class PromptResponse(BaseModel):
    html_code: str = Field(..., alias="htmlCode")
    name: str = Field(..., alias="name")


# TODO: stream this in the future?
@app.post("/generate-game", response_model=PromptResponse)
async def get_llm_response(request: PromptRequest):
    # Initialize the LLM (replace 'YOUR_API_KEY' with your actual API key)
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    prompt_code = ChatPromptTemplate.from_messages(
        [
            (
                # Make sure that the client is unable to make moves when it is not his turn.
                "system",
                """
                        You are a world class video game developer, 

                        You generate the code for a two player turn-based game in a single HTML file.
                        The provided HTML file runs inside of a react i-frame. The exact same code will 
                        be used on two different clients, which play against each other, so it is important
                        to generate the code such that both client's state is perfectly in sync.

                        It will have a sendMessageToParent function, that will send the encoded move 
                        of the current client to its parent component which will then end up on the other
                        player's game via websocket. It will utilize the postMessage function of the window.parent:

                        function sendMessageToParent(message) {{
                            window.parent.postMessage(JSON.stringify(message), "*");
                        }}

                        It requires to have a window event listener which will serve as a way to listen 
                        for the other player's moves (implemented using window.addEventListener). Like such:

                        window.addEventListener("message", handleMessage);

                        Optionally, you can chose to include a function switchTurn() that switches the player turn.

                        In its raw state, assume it's never the current client's turn initially.

                        The data sent between both clients is a stringified JSON that encodes the 
                        corresponding move made by the player. The JSON contains the following two fields:

                        1. type: can be "move" or "turn". 
                        "move" indicates whether the data is meant to represent a move that is made.
                        "turn" (Optional) indicates that the current client is the first to play, it will set the appropriate
                        state and unlock the game inputs and interactions accordingly.
                        VERY IMPORTANT: DO NOT SEND TO THE PARENT WINDOW MESSAGES OF TYPE "turn". SIMPLY HANDLE IT IN THE 
                        handleMessage() function. Send an alert() when a message with type "turn" is detected.

                        2. move: this field will contain the information for the move made by a client. It's up to you
                        to decide how to encode this based on the prompt.

                        Ensure that when it is not the player's turn, that he cannot make a move.

                        Try to make the game look pretty, adding animations when possible.
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


# You can run the server with: uvicorn your_file_name:app --reload
