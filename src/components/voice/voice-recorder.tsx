'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Brain,
  Shield
} from 'lucide-react'

interface Recording {
  id: string
  duration: number
  timestamp: Date
  status: 'recording' | 'processing' | 'completed' | 'failed'
  transcription?: string
  summary?: string
  actionItems?: string[]
}

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const duration = recordingTime
        
        // Create new recording
        const newRecording: Recording = {
          id: Date.now().toString(),
          duration,
          timestamp: new Date(),
          status: 'processing'
        }
        
        setRecordings(prev => [newRecording, ...prev])
        setIsProcessing(true)
        
        // Process audio (simulate transcription)
        await processAudio(audioBlob, newRecording.id)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const processAudio = async (audioBlob: Blob, recordingId: string) => {
    try {
      // Convert to base64 for API call
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Audio = reader.result as string
        
        // Call transcription API
        const response = await fetch('/api/agents/secretary/crm-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'voice-update',
            data: {
              audio: base64Audio,
              transcription: "Just finished a great call with Sarah from TechVentures. They're very interested in our AI automation platform, especially the scalability features. They want to schedule a demo with their technical team next week. I should prepare a custom proposal focusing on their expansion plans.",
              duration: recordingTime
            }
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          setRecordings(prev => prev.map(rec => 
            rec.id === recordingId 
              ? {
                  ...rec,
                  status: 'completed',
                  transcription: result.data.transcription.text,
                  summary: result.data.transcription.summary,
                  actionItems: result.data.transcription.actionItems
                }
              : rec
          ))
        } else {
          setRecordings(prev => prev.map(rec => 
            rec.id === recordingId 
              ? { ...rec, status: 'failed' }
              : rec
          ))
        }
        
        setIsProcessing(false)
      }
      
      reader.readAsDataURL(audioBlob)
      
    } catch (error) {
      console.error('Error processing audio:', error)
      setRecordings(prev => prev.map(rec => 
        rec.id === recordingId 
          ? { ...rec, status: 'failed' }
          : rec
      ))
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = (status: Recording['status']) => {
    switch (status) {
      case 'recording':
        return <Mic className="h-4 w-4 text-red-500" />
      case 'processing':
        return <Brain className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <Shield className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: Recording['status']) => {
    switch (status) {
      case 'recording':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Voice Assistant</h1>
        <p className="text-muted-foreground">Record calls and let the Secretary Agent transcribe and update your CRM</p>
      </div>

      {/* Recording Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Recording
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                size="lg"
                className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
              >
                {isRecording ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              {isRecording && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isProcessing ? 'Processing audio...' : 'Click to start recording'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recordings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div key={recording.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(recording.status)}
                      <div>
                        <h4 className="font-medium">
                          {recording.status === 'processing' ? 'Processing...' : `Recording ${recording.id}`}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(recording.duration)}</span>
                          <span>•</span>
                          <span>{recording.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(recording.status)}>
                      {recording.status}
                    </Badge>
                  </div>
                  
                  {recording.transcription && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium mb-2">Transcription</h5>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                            {recording.transcription}
                          </p>
                        </div>
                        
                        {recording.summary && (
                          <div>
                            <h5 className="font-medium mb-2">Summary</h5>
                            <p className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded">
                              {recording.summary}
                            </p>
                          </div>
                        )}
                        
                        {recording.actionItems && recording.actionItems.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Action Items</h5>
                            <ul className="text-sm space-y-1">
                              {recording.actionItems.map((item, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Update CRM
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Export Notes
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {recordings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recordings yet. Start recording to see them here.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}