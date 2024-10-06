'use client'
import * as React from 'react';
import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { Box, styled } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';



const StyledDateCalendar = styled(DateCalendar)({
    '&.MuiDateCalendar-root': {
      margin: '5px',
      height: '800px',
      width: '800px',
      maxHeight: 'none',
      '& .MuiDayCalendar-weekDayLabel': {
        fontSize: '1rem',
      },
      '& div[role="row"]': {
        justifyContent: 'space-around',
      },
      '& .MuiDayCalendar-slideTransition': {
        minHeight: '500px',
      },
      '& .MuiPickersDay-root': {
        height: '50px',
        width: '50px',
        fontSize: '1rem',
      },
    },
  });
// not necessary
function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

/**
 * Mimic fetch with abort controller https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
 * ⚠️ No IE11 support
 */

// not necessary
function fakeFetch(date, { signal }) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const daysInMonth = date.daysInMonth();
      const daysToHighlight = [1, 2, 3].map(() => getRandomNumber(1, daysInMonth));

      resolve({ daysToHighlight });
    }, 500);

    signal.onabort = () => {
      clearTimeout(timeout);
      reject(new DOMException('aborted', 'AbortError'));
    };
  });
}

// not necessary
const initialValue = dayjs('2022-04-17');






// ###################################

function ServerDay(props) {
const [open, setOpen] = React.useState(false);
//const [selectedDate, setSelectedDate] = React.useState(null); // State to hold the selected date

const handleClickOpen = () => {
    
    //setSelectedDate(date); // Set the selected date
    setOpen(true);
};

const handleClose = () => {
    setOpen(false);
};
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isSelected =
    !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

const handleClick = () => {
// Handle the date click event here
handleClickOpen();
//console.log(`YAYAYAYAYDate clicked: ${day.format('YYYY-MM-DD')}`);
//alert(`YAYAYAYADate clicked: ${day.format('YYYY-MM-DD')}`); // Changed console log to alert
};

const hasBadge = (date) => {
    return highlightedDays.includes(date.date()); // New function to check if the date has a badge
};

  return (
    <>
    <Badge
        anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}  
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isSelected ? <span style={{ fontSize: '1.5rem' }}>🌚</span> : undefined} // Increased font size
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} onClick={handleClick} />
      
    </Badge>
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Your mood on this day...</DialogTitle>
        <div style={{ padding: '20px' }}>
          <p>{hasBadge(day) ? "This date has a badge!" : "This date does not have a badge."}</p>
        </div>
      </Dialog>
</>
  );
}

export default function DateCalendarServerRequest() {
    

  const requestAbortController = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [highlightedDays, setHighlightedDays] = React.useState([1, 2, 15]);

  const fetchHighlightedDays = (date) => {
    const controller = new AbortController();
    fakeFetch(date, {
      signal: controller.signal,
    })
      .then(({ daysToHighlight }) => {
        setHighlightedDays(daysToHighlight);
        setIsLoading(false);
      })
      .catch((error) => {
        // ignore the error if it's caused by `controller.abort`
        if (error.name !== 'AbortError') {
          throw error;
        }
      });

    requestAbortController.current = controller;
  };

  React.useEffect(() => {
    fetchHighlightedDays(initialValue);
    // abort request on unmount
    return () => requestAbortController.current?.abort();
  }, []);

  const handleMonthChange = (date) => {
    if (requestAbortController.current) {
      // make sure that you are aborting useless requests
      // because it is possible to switch between months pretty quickly
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    setHighlightedDays([]);
    fetchHighlightedDays(date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <React.Fragment>
      <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="flex-start" 
      height="-50vh"
      mt={4}
      
    > 
    <Box 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // White with 80% opacity
          borderRadius: '8px', // Rounded corners
          padding: '8px', // Padding around the calendar
          boxShadow: 3, // Add some shadow for visibility
          width: '850px', // Decreased width
          height: '500px', 
        }}
      >
      <StyledDateCalendar
        sx={{ width: '600px', height: '600px' }}
        defaultValue={initialValue}
        loading={isLoading}
        onMonthChange={handleMonthChange}
        renderLoading={() => <DayCalendarSkeleton />}
        slots={{
          day: ServerDay,
        }}
        slotProps={{
          day: {
            highlightedDays,
          },
        }}
      />
      </Box>
      </Box>
      </React.Fragment>   
    </LocalizationProvider>
  );
}
