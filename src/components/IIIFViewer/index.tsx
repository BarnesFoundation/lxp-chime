import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';

type IIIFViewerProps = {
  tileSources: string[];
  setZoomOut: React.Dispatch<React.SetStateAction<() => void>>;
};

/**
 * Setup for IIIFViewer.
 * This will use a ref to drop out of react.
 */
const IIIFViewer: React.FC<IIIFViewerProps> = ({ tileSources, setZoomOut }: IIIFViewerProps) => {
  const ref: React.Ref<HTMLDivElement> = useRef(null);

  // Pass ref to useEffect, canvas for IIIF viewer will be dropped underneath the ref.
  useEffect(() => {
    const osd = OpenSeadragon({
      element: ref.current !== null ? ref.current : undefined,
      visibilityRatio: 1.0,
      constrainDuringPan: true,
      tileSources,
      navigatorBackground: '#1f1f1f',
      showNavigationControl: false,
    });

    // Add event handler to resize and set home callback on images load.
    osd.addHandler('open', () => {
      const imageBounds = osd.world.getItemAt(0).getBounds();
      osd.viewport.fitBounds(imageBounds, true);

      const zoomOut = () => {
        osd.viewport.fitBounds(imageBounds);
      };

      // To set function, we need to wrap our function in an anonymous function.
      // This will overwrite previous state as () has 0 params, and the function will be set as state.
      setZoomOut(() => zoomOut);
    }, []);

    osd.addHandler('canvas-click', function (event) {
      // The canvas-click event gives us a position in web coordinates.
      const webPoint = event.position;

      // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
      const viewportPoint = osd.viewport.pointFromPixel(webPoint);

      // Convert from viewport coordinates to image coordinates.
      const imagePoint = osd.viewport.viewportToImageCoordinates(viewportPoint);

      // Show the results.
      console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString());

      // TODO: share coordinates via chime sdk
    });

    return () => {
      osd.destroy();
    };
  }, [tileSources, setZoomOut]);

  return (
    <div
      className="app__iiif-viewer iiif-viewer"
      ref={ref}
      style={{ width: '100%', height: '100%' }}
    >
    </div>
  );
};

export default IIIFViewer;
