import React from "react";
import { Dialog, DialogTitle, DialogContent, Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import "./DialogModal.styles.less";

interface DialogModalProps {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  content: React.ReactNode;
}

const DialogModal = ({ open, onClose, title, content }: DialogModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      keepMounted
      classes={{ paper: "qprofile__dialog qprofile__dialog--spring" }}
    >
      <Box id="qprofile">
        <DialogTitle className="qprofile__titlebar">
          <div className="qprofile__header">{title}</div>
          <IconButton onClick={onClose} size="small" className="qprofile__close" aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers className="qprofile__content">
          {content}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default DialogModal;