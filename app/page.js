'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [task, setTask] = useState('')

  async function loadTasks() {
    const { data } = await supabase.from('tasks').select('*').order('id')
    if (data) setTasks(data)
  }

  useEffect(() => {
    loadTasks()

    const channel = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => loadTasks()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function addTask() {
    if (!task.trim()) return

    await supabase.from('tasks').insert({
      task: task,
      phase: 'General',
      owner: 'Family',
      status: 'Not Started',
      priority: 'Medium',
      notes: '',
      done: false,
    })

    setTask('')
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
  }

  return (
    <div style={{ padding: 40, fontFamily: 'Arial', maxWidth: 900, margin: 'auto' }}>
      <h1>PCS Move Dashboard</h1>
      <p>Shared tracker for your move to Hurlburt Field.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add new task"
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={addTask} style={{ padding: '10px 20px' }}>
          Add
        </button>
      </div>

      <table width="100%" border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Task</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.task}</td>
              <td>
                <button onClick={() => deleteTask(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
