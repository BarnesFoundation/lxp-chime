import React, { useEffect, useState } from 'react';
import IIIFViewer from '../../components/IIIFViewer';

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
  const [_zoomOut, setZoomOut] = useState(() => () => null as unknown as void);

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

  return (
    <div className='canvas'>
      <IIIFViewer
        tileSources={selectedSourceURL}
        setZoomOut={setZoomOut}
      />
    </div>
  );
}
