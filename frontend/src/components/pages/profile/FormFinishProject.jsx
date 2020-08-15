import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux';
import { addToFinishedProjectsThunk } from '../../../store/slice';
import Tag from '../../Tag';

export default function FormFinishProject(props) {
  const dispatch = useDispatch()
  let { title, description, budget, publishedAt, comment, tags } = props.offer

  const [realBudget, setRealBudget] = useState(budget)
  const [finalComment, setFinalComment] = useState(comment)

  const elRef = useRef(null)
  if (!elRef.current) {
    const div = document.createElement('div')
    elRef.current = div
  }

  const escFunction = useCallback((event) => {
    if (event.keyCode === 27) {
      props.onCancel()
    }
  }, [])

  useEffect(() => {
    const modalRoot = document.getElementById('modal')
    modalRoot.appendChild(elRef.current)
    document.addEventListener("keydown", escFunction, false);
    return () => {
      modalRoot.removeChild(elRef.current)
      document.removeEventListener("keydown", escFunction, false);
    }
  }, [])

  const budgetHandler = (e) => {
    setRealBudget(e.target.value)
  }

  const commentHandler = (e) => {
    setFinalComment(e.target.value)
  }


  const submitHandler = (e) => {
    e.preventDefault()
    const finishedProject = {
      ...props.offer,
      budget: realBudget,
      finishedAt: new Date(),
      comment,
    }
    dispatch(addToFinishedProjectsThunk(finishedProject))
    props.onCancel()
  }



  if (props.isModal)
    return createPortal(
      <div className="modal-overlay" >
        <div className="modal-window">
          <article className="startProject_card_extended">
            <form className="form_startProject" action="">
              <button className="startProject_closeBtn" onClick={props.onCancel}>X</button>
              <p className="startProject_MainText">{title}</p>
              <p className="startProject_Text">{description}</p>
              <p className="startProject_dateTime">{publishedAt}</p>
              <div className="wrap_redactBudget">
              <div className="startProject_lableRedactBudget">Изменить бюджет</div>
              <input className="startProject_inpBudget" onChange={budgetHandler} type="text" name="budget" value={realBudget} />
              </div>
              <div className="wrap_comments">
              <div className="startProject_lableComments">Добавить заметку</div>
              <textarea className="startProject_comments" onChange={commentHandler} name="comment" id="" cols="30" rows="10" value={finalComment}></textarea>
              </div>
              <div className="startProject_wrapTags">
                {tags.map((tag, index) => <Tag key={index} className="tag" tag={tag}></Tag>)}
              </div>
              <div className="wrap_btn_startProject">
              <button onClick={props.onCancel} className="btnCancel">Отменить</button>
              <button onClick={submitHandler} className="btn_formStartProj_DOB">Добавить в завершенное</button>
              {/* <a href={url} target="_blank"><button>Перейти к обьявлению</button></a> */}
              </div>
            </form>
          </article>
        </div>
      </div>,
      elRef.current
    )
  else return null
}


