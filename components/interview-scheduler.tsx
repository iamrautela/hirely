'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, User, CheckCircle2, X } from 'lucide-react'
import type { Interview, InterviewType } from '@/lib/types'

interface InterviewSchedulerProps {
  onSchedule?: (interview: Partial<Interview>) => void
  existingInterviews?: Interview[]
}

const INTERVIEW_TYPES: InterviewType[] = ['coding', 'frontend', 'backend', 'uiux', 'aiml', 'devops', 'fullstack']

export function InterviewScheduler({ onSchedule, existingInterviews = [] }: InterviewSchedulerProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [interviewType, setInterviewType] = useState<InterviewType>('coding')
  const [duration, setDuration] = useState('60')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const isSlotBooked = (time: string) => {
    if (!date) return false
    return existingInterviews.some(
      (interview) =>
        new Date(interview.scheduledAt).toDateString() === date.toDateString() &&
        new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) === time
    )
  }

  const handleSchedule = () => {
    if (!date || !selectedTime) {
      alert('Please select date and time')
      return
    }

    const [hours, minutes] = selectedTime.split(':').map(Number)
    const scheduledDate = new Date(date)
    scheduledDate.setHours(hours, minutes, 0, 0)

    const newInterview: Partial<Interview> = {
      candidateId: candidateEmail,
      interviewType,
      scheduledAt: scheduledDate.getTime(),
      duration: parseInt(duration),
      status: 'scheduled',
      notes,
    }

    onSchedule?.(newInterview)
    setIsOpen(false)
    // Reset form
    setCandidateEmail('')
    setNotes('')
    setSelectedTime('')
  }

  const bookedSlots = existingInterviews
    .filter((i) => new Date(i.scheduledAt).toDateString() === date?.toDateString())
    .map((i) => new Date(i.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Schedule Interview</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card className="border-border bg-card p-4">
          <h3 className="mb-4 font-semibold text-foreground">Select Date</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < new Date()}
            className="flex justify-center"
          />
        </Card>

        {/* Time Slots */}
        <div className="space-y-4">
          <Card className="border-border bg-card p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Clock className="h-4 w-4" />
              Available Times
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {generateTimeSlots().map((time) => {
                const booked = isSlotBooked(time)
                return (
                  <button
                    key={time}
                    onClick={() => !booked && setSelectedTime(time)}
                    disabled={booked}
                    className={`rounded-lg p-2 text-sm font-medium transition-colors ${
                      booked
                        ? 'cursor-not-allowed bg-secondary/50 text-muted-foreground line-through'
                        : selectedTime === time
                          ? 'bg-online text-background'
                          : 'border border-border bg-transparent hover:border-online'
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
            {bookedSlots.length > 0 && (
              <div className="mt-4 rounded-lg bg-secondary p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Booked slots: {bookedSlots.join(', ')}
                </p>
              </div>
            )}
          </Card>

          {/* Interview Details */}
          <Card className="border-border bg-card p-4">
            <h3 className="mb-4 font-semibold text-foreground">Interview Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Interview Type</label>
                <Select value={interviewType} onValueChange={(value) => setInterviewType(value as InterviewType)}>
                  <SelectTrigger className="mt-1 bg-secondary text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {INTERVIEW_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Duration (minutes)</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="mt-1 bg-secondary text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Candidate Email</label>
                <Input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="mt-1 bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Interview preparation notes..."
                  className="mt-1 min-h-20 resize-none bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                />
              </div>

              <Button
                onClick={handleSchedule}
                disabled={!date || !selectedTime || !candidateEmail}
                className="w-full gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Schedule Interview
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Scheduled Interviews */}
      {existingInterviews.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Upcoming Interviews</h3>
          <div className="space-y-2">
            {existingInterviews
              .filter((i) => i.status === 'scheduled')
              .slice(0, 5)
              .map((interview) => {
                const scheduledDate = new Date(interview.scheduledAt)
                return (
                  <Card key={interview.id} className="border-border bg-card/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{interview.candidateId}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {interview.interviewType} • {scheduledDate.toLocaleDateString()} at{' '}
                            {scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{interview.duration}min</Badge>
                    </div>
                  </Card>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
