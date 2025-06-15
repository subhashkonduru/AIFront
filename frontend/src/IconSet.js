import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const IconSet = ({ onFinish }) => {
  const icons = [
    { icon: CodeIcon, title: 'Code' },
    { icon: SecurityIcon, title: 'Security' },
    { icon: GavelIcon, title: 'Compliance' },
    { icon: BugReportIcon, title: 'Testing' },
  ];

  const [checked, setChecked] = useState(new Array(icons.length).fill(false));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    let current = 0;
    const interval = setInterval(() => {
      // Safely capture current index
      const indexToUpdate = current;
      if (indexToUpdate < icons.length) {
        setChecked(prev => {
          const updated = [...prev];
          updated[indexToUpdate] = true;
          return updated;
        });
        current++;
      } else {
        clearInterval(interval);
        if (onFinish) onFinish();
      }
    }, 600);

    return () => clearInterval(interval);
  }, [icons.length, onFinish]);

  return (
    <Box display="flex" justifyContent="space-around" alignItems="center" mt={2}>
      {icons.map(({ icon: IconComponent, title }, index) => (
        <Box key={index} display="flex" flexDirection="column" alignItems="center">
          {checked[index] ? (
            <CheckCircleIcon sx={{ color: 'green', fontSize: 40 }} />
          ) : (
            <IconComponent fontSize="large" />
          )}
          <Typography variant="caption">{title}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default IconSet;
