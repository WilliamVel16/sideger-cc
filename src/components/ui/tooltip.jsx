import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { openUrl } from '@tauri-apps/plugin-opener';

export default function TooltipInfo({ href, title }) {
  const handleClick = async (e) => {
    await openUrl(href);
  };

  return (
    <Tooltip title={`Leer sobre ${title}`} arrow>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          ml: 1,
          color: "primary.main",
          p: 0.5,
          "&:hover": { color: "primary.dark" },
        }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}