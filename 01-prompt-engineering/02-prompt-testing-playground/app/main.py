from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import Base, engine, SessionLocal, get_db
from app.models import Prompt, PromptVersion, TestResult
from app.schemas import VersionCreate, CompareRequest, RatingUpdate
from app.services import render_prompt, generate_output

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "static"

def seed(db: Session):
    if db.scalar(select(Prompt).where(Prompt.name == "Technical Summarizer")):
        return
    p = Prompt(name="Technical Summarizer", description="Prompt debugging example")
    db.add(p); db.flush()
    db.add_all([
        PromptVersion(prompt_id=p.id, version=1,
            template="Summarize the following text:\n\n{input}",
            change_notes="Baseline: task only."),
        PromptVersion(prompt_id=p.id, version=2,
            template="You are an expert technical writer.\nSummarize clearly and concisely:\n\n{input}",
            change_notes="Added role and clarity instructions."),
        PromptVersion(prompt_id=p.id, version=3,
            template="You are an expert technical writer.\nSummarize for a non-technical audience.\nRequirements:\n- Maximum 5 bullet points\n- Preserve important facts\n- Avoid unnecessary jargon\n- Do not invent facts\n\nText:\n{input}",
            change_notes="Added audience, format and grounding constraints.")
    ])
    db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db: seed(db)
    yield

app = FastAPI(title="Prompt Testing Playground API", version="1.0.0", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=STATIC), name="static")

@app.get("/", include_in_schema=False)
def home(): return FileResponse(STATIC / "index.html")

@app.get("/health")
def health(): return {"status": "ok"}

@app.get("/api/prompts")
def prompts(db: Session = Depends(get_db)):
    items = list(db.scalars(select(Prompt).options(selectinload(Prompt.versions))).unique())
    return [{"id":p.id,"name":p.name,"description":p.description,
             "versions":[{"id":v.id,"version":v.version,"template":v.template,"change_notes":v.change_notes}
                         for v in sorted(p.versions,key=lambda x:x.version)]} for p in items]

@app.post("/api/prompts/{prompt_id}/versions", status_code=201)
def create_version(prompt_id:int, body:VersionCreate, db:Session=Depends(get_db)):
    if not db.get(Prompt,prompt_id): raise HTTPException(404,"Prompt not found")
    versions=list(db.scalars(select(PromptVersion).where(PromptVersion.prompt_id==prompt_id)))
    number=max([v.version for v in versions], default=0)+1
    v=PromptVersion(prompt_id=prompt_id,version=number,template=body.template,change_notes=body.change_notes)
    db.add(v); db.commit(); db.refresh(v)
    return {"id":v.id,"version":v.version,"template":v.template,"change_notes":v.change_notes}

@app.post("/api/compare")
def compare(body:CompareRequest, db:Session=Depends(get_db)):
    versions=list(db.scalars(select(PromptVersion).where(
        PromptVersion.prompt_id==body.prompt_id, PromptVersion.id.in_(body.version_ids))))
    if len(versions)!=len(set(body.version_ids)): raise HTTPException(404,"One or more versions not found")
    answer=[]
    for v in sorted(versions,key=lambda x:x.version):
        rendered=render_prompt(v.template,body.test_input)
        try: output,ms=generate_output(rendered,v.version)
        except ValueError as e: raise HTTPException(400,str(e))
        r=TestResult(prompt_version_id=v.id,test_input=body.test_input,rendered_prompt=rendered,
                     output=output,response_time_ms=ms)
        db.add(r); db.flush()
        answer.append({"result_id":r.id,"version":v.version,"rendered_prompt":rendered,
                       "output":output,"response_time_ms":ms,"word_count":len(output.split())})
    db.commit()
    return answer

@app.patch("/api/results/{result_id}/rating")
def rate(result_id:int, body:RatingUpdate, db:Session=Depends(get_db)):
    r=db.get(TestResult,result_id)
    if not r: raise HTTPException(404,"Result not found")
    r.rating=body.rating; r.notes=body.notes; db.commit()
    return {"message":"Observation saved"}

@app.get("/api/prompts/{prompt_id}/history")
def history(prompt_id:int, db:Session=Depends(get_db)):
    rows=db.execute(select(TestResult,PromptVersion).join(
        PromptVersion,TestResult.prompt_version_id==PromptVersion.id
    ).where(PromptVersion.prompt_id==prompt_id).order_by(TestResult.created_at.desc())).all()
    return [{"result_id":r.id,"version":v.version,"response_time_ms":r.response_time_ms,
             "rating":r.rating,"notes":r.notes,"created_at":r.created_at} for r,v in rows]
