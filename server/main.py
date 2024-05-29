from fastapi import FastAPI

app = FastAPI()


@app.get(path="/health", status_code=200)
def health_check_server():
    return {"status": "OK"}
