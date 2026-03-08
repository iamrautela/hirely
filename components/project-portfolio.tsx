'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Project, User } from '@/lib/types'
import { Plus, X, ExternalLink, Github } from 'lucide-react'

export function ProjectPortfolio({ user }: { user: User }) {
  const [projects, setProjects] = useState<Project[]>(user.projects || [])
  const [showForm, setShowForm] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    url: '',
    tech: '',
  })

  const addProject = () => {
    if (!newProject.title.trim()) return
    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      url: newProject.url,
      tech: newProject.tech.split(',').map((t) => t.trim()),
      likes: 0,
    }
    setProjects([...projects, project])
    setNewProject({ title: '', description: '', url: '', tech: '' })
    setShowForm(false)
  }

  const removeProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id))
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Portfolio</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-lg border border-border bg-secondary p-4">
          <Input
            placeholder="Project title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            className="bg-input text-foreground placeholder:text-muted-foreground"
          />
          <Input
            placeholder="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            className="bg-input text-foreground placeholder:text-muted-foreground"
          />
          <Input
            placeholder="URL"
            value={newProject.url}
            onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
            className="bg-input text-foreground placeholder:text-muted-foreground"
          />
          <Input
            placeholder="Tech stack (comma separated)"
            value={newProject.tech}
            onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })}
            className="bg-input text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addProject} className="flex-1">
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects added yet</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-border bg-secondary p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground">{project.title}</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs rounded bg-background px-2 py-1 text-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => removeProject(project.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
