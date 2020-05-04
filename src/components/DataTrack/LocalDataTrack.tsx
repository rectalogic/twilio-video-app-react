import { useEffect } from 'react';
import { LocalDataTrack as ILocalDataTrack, Track } from 'twilio-video';
import { ParticipantLocation } from '../Participant/ParticipantLocation';

interface DataTrackProps {
  track: ILocalDataTrack;
  location: ParticipantLocation;
  locationRequested: Track.SID;
}

export default function LocalDataTrack({ track, location, locationRequested }: DataTrackProps) {
  useEffect(() => {
    // Initially send a length 1 buffer, flag to trigger all remotes to resend their locations
    track.send(new Float64Array(1));
  }, [track]);

  // When locationRequested changes, a remote participant is requesting a location resend
  useEffect(() => {
    track.send(new Float64Array([location.x, location.z, location.ry]));
  }, [track, location, locationRequested]);
  return null;
}