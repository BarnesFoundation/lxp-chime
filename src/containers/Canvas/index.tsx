import React, { useEffect, useState } from 'react';
import IIIFViewer from '../../components/IIIFViewer';
import { useDataEvents } from '../../providers/DataEventsProvider';

enum SelectTypes {
    Artworks = 'artworks',
    Ensembles = 'ensembles',
}

/**
 * Convert index into string array for OSD tile sources.
 * @param {string} index numerical index for accessing image from S3.
 * @returns {string[]} tile source array to be passed to OSD.
 */
const getTileSourceURL = ({ index, type }: { index: string, type: SelectTypes }): string[] => {
  if (type === SelectTypes.Artworks) return [`https://collection-tif-tiler.s3.amazonaws.com/tiles/${index}/info.json`];
  if (type === SelectTypes.Ensembles) return [`https://collection-tif-tiler.s3.amazonaws.com/ensembleTiles/${index}/info.json`];
  return [];
};

export default function Chat() {
  // set default variables
  const defaultInvno = 'BF962';
  const defaultEnsembleIndex = '1';
  let query: { index: string, type: SelectTypes } = { index: defaultInvno, type: SelectTypes.Artworks };

  const [invno, _setInvno] = useState(defaultInvno);
  const [ensembleIndex, _setEnsembleIndex] = useState(defaultEnsembleIndex);
  const [selectedSource, _setSelectedSource] = useState(query);
  const [selectedSourceURL, setSelectedSourceURL] = useState([] as string[]);
  const [leader, setLeader] = useState(false);

  const { sendEvent } = useDataEvents();

  // Set query with invno and ensembleIndex values
  if (invno) {
    query = { index: invno as string, type: SelectTypes.Artworks };
  }
  if (ensembleIndex) {
    query = { index: ensembleIndex as string, type: SelectTypes.Ensembles };
  }

  useEffect(() => {
    setSelectedSourceURL(getTileSourceURL(selectedSource));
  }, [selectedSource]);

  const handleLeaderChange = () => {
    if (leader) {
      // If user is currently the leader, do not let them uncheck the box
      return;
    } else {
      // If user is not currently the leader, let them become the leader
      setLeader(true);
      // Send event to to notify other call participants
      sendEvent(JSON.stringify({ type: 'leader-change' }));
    }
  };

  useEffect(() => {
    console.log('leader udpated:', leader);
  }, [leader]);

  return (
    <div className='canvas' style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ zIndex: 10 }}>
        <input type="checkbox" id="leader" name="leader" checked={leader} onChange={handleLeaderChange} />
        <label htmlFor='leader'>Leader</label>
      </div>
      <IIIFViewer
        tileSources={selectedSourceURL}
        leader={leader}
        setLeader={setLeader}
      />
    </div>
  );
}
