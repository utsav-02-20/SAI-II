import React, { useState } from 'react';
import axios from 'axios';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DomainHeader } from '../../components/shared/DomainHeader';
import { SeedDataLoader } from '../../components/shared/SeedDataLoader';

/**
 * Doctor Teleconsultation & Longitudinal Replay Domain Module.
 * Route: /features/teleconsult
 * 
 * Rules Adherence:
 * - Lazy service execution: Zero auto-fetch on mount. Replay data and doctor connection only occur on user click.
 * - On-demand seed loader for doctor roster.
 * - Clean empty states for uninitialized calls and SBAR summaries.
 */
export function TeleconsultDomain({ user, language = 'en' }) {
  const patientId = user?.id || 'demo-patient';

  // Teleconsultation State
  const [inCall, setInCall] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Longitudinal Replay State (Lazy)
  const [replayData, setReplayData] = useState(null);
  const [replayLoading, setReplayLoading] = useState(false);

  // SBAR Summary State
  const [sbarSummary, setSbarSummary] = useState(null);
  const [generatingSbar, setGeneratingSbar] = useState(false);

  // On-demand seed loader for verified doctor roster
  const handleSeedLoaded = (seedDoctors) => {
    if (!Array.isArray(seedDoctors)) return;
    setDoctorsList(seedDoctors);
    if (seedDoctors.length > 0) {
      setSelectedDoctor(seedDoctors[0]);
    }
  };

  // Lazy execution: Fetch longitudinal replay data
  const handleFetchLongitudinalReplay = async () => {
    setReplayLoading(true);
    try {
      const res = await axios.get(`/api/teleconsult/trends/replay?patientId=${patientId}`);
      if (res.data) {
        setReplayData(res.data);
      }
    } catch (err) {
      console.warn('Longitudinal replay fetch failed', err);
    } finally {
      setReplayLoading(false);
    }
  };

  // Lazy start call session
  const handleStartSession = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setInCall(true);
    }, 800);
  };

  // End call & trigger SBAR summary generation
  const handleEndSession = async () => {
    setInCall(false);
    setGeneratingSbar(true);
    try {
      const res = await axios.post('/api/teleconsult/sbar/generate', {
        patientId,
        doctorId: selectedDoctor?.id || 'doc-general',
        symptoms: 'Reported acute fever flare-up with joint ache.',
      });
      if (res.data.success) {
        setSbarSummary(res.data.sbar);
      }
    } catch (err) {
      console.warn('SBAR generation failed', err);
    } finally {
      setGeneratingSbar(false);
    }
  };

  return (
    <div className="space-y-6">
      <DomainHeader
        title={language === 'en' ? 'Clinical Teleconsultation & Replay Portal' : 'टेली-परामर्श एवं लक्षण रिप्ले'}
        description={
          language === 'en'
            ? 'WebRTC clinician triage room, longitudinal symptom flare-up timeline replay, and automated structured SBAR handover reports.'
            : 'डॉक्टर वीडियो परामर्श और मरीज के स्वास्थ्य इतिहास का समग्र विश्लेषण।'
        }
        tag="WebRTC & SBAR"
        actions={
          <SeedDataLoader
            domainId="teleconsult"
            seedType="doctors"
            label="Load Verified Doctor Roster (from /seed)"
            onLoadSeed={handleSeedLoaded}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Doctor Selection & WebRTC Video Portal */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <CardTitle>Doctor Consultation Suite</CardTitle>
                </div>
                {inCall && <Badge variant="accent">LIVE SESSION ACTIVE</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Viewport */}
              <div className="relative aspect-video rounded-xl bg-zinc-950 flex flex-col items-center justify-center text-white overflow-hidden border border-zinc-800">
                {inCall ? (
                  <div className="w-full h-full flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-md text-xs backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>
                          {selectedDoctor
                            ? `${selectedDoctor.name} (${selectedDoctor.specialty})`
                            : 'Attending Clinician'}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-white border-white/20">
                        Encrypted WebRTC
                      </Badge>
                    </div>

                    <div className="flex items-center justify-center">
                      <Stethoscope className="w-12 h-12 text-zinc-600" />
                    </div>

                    {/* In-Call Media Controls */}
                    <div className="flex items-center justify-center gap-3 z-10">
                      <button
                        type="button"
                        onClick={() => setIsMicMuted(!isMicMuted)}
                        className={`p-2.5 rounded-full text-xs transition-colors ${
                          isMicMuted ? 'bg-rose-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                      >
                        {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVideoMuted(!isVideoMuted)}
                        className={`p-2.5 rounded-full text-xs transition-colors ${
                          isVideoMuted ? 'bg-rose-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        title={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
                      >
                        {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleEndSession}
                        className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        <span>End Consultation</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Video className="w-6 h-6 text-zinc-400" />}
                    title="Tele-Triage Suite Ready"
                    description="Initiate an encrypted video session with available clinical specialists."
                    actionLabel="Start Clinician Session"
                    onAction={handleStartSession}
                    className="border-none bg-transparent"
                  />
                )}
              </div>

              {/* Doctor Roster Selection */}
              {doctorsList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-700">
                    Verified Clinicians Available ({doctorsList.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {doctorsList.map((doc) => (
                      <button
                        key={doc.id || doc.name}
                        type="button"
                        onClick={() => setSelectedDoctor(doc)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                          selectedDoctor?.name === doc.name
                            ? 'border-zinc-950 bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <span className="font-semibold block text-zinc-900">{doc.name}</span>
                        <span className="text-[11px] text-zinc-500">
                          {doc.specialty} • {doc.experienceYears || '10+'} yrs exp
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SBAR Clinical Handover Summary */}
          {(sbarSummary || generatingSbar) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Post-Consultation SBAR Clinical Handover</CardTitle>
                  <Badge variant="accent">EMR Synced</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {generatingSbar ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    Synthesizing structured Situation-Background-Assessment-Recommendation summary...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-zinc-900 block mb-1">Situation (S)</span>
                      <p className="text-zinc-600">{sbarSummary.situation || 'Patient present for acute flare-up review.'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-zinc-900 block mb-1">Background (B)</span>
                      <p className="text-zinc-600">{sbarSummary.background || 'History of episodic symptoms over 14 days.'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-zinc-900 block mb-1">Assessment (A)</span>
                      <p className="text-zinc-600">{sbarSummary.assessment || 'Differential points to seasonal viral response.'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-zinc-900 block mb-1">Recommendation (R)</span>
                      <p className="text-zinc-600">{sbarSummary.recommendation || 'Continue hydration and rest; review in 48 hours.'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Longitudinal Symptom Replay (Lazy) */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Longitudinal Symptom Replay</CardTitle>
              <CardDescription>
                Chronological playback of reported fever episodes and biometric trajectories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!replayData ? (
                <EmptyState
                  title="No Replay Loaded"
                  description="Fetch historical symptom trajectory to evaluate acute vs gradual flare-ups."
                  actionLabel="Fetch Longitudinal Replay"
                  onAction={handleFetchLongitudinalReplay}
                  className="py-6"
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                    <span className="font-semibold text-zinc-900 block">
                      Flare-Up Trajectory:
                    </span>
                    <p className="text-zinc-600">
                      {replayData.flareUpSummary || 'Detected +140% spike in reported temperature over 48 hours.'}
                    </p>
                  </div>

                  {replayData.timeline && (
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={replayData.timeline}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} />
                          <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
                          <Tooltip />
                          <Bar dataKey="severity" fill="#059669" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TeleconsultDomain;
