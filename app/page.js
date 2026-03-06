'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard(){

  const [tasks,setTasks] = useState([])
  const [task,setTask] = useState('')

  async function loadTasks(){
    const { data } = await supabase.from('tasks').select('*').order('id')
    if(data) setTasks(data)
  }

  useEffect(()=>{

    loadTasks()

    const channel = supabase.channel('tasks')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        ()=> loadTasks()
      )
      .subscribe()

    return ()=> supabase.removeChannel(channel)

  },[])
