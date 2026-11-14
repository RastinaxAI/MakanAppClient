import {
  Plus as PlusIcon,
  Mic as MicIcon,
  Smile as SmileIcon,
  ArrowUp,
  Pin as PinIcon,
  Reply as ReplyIcon,
  Copy as CopyIcon,
  SquarePen as SquarePenIcon,
  Trash2 as TrashIcon,
  Download as DownloadIcon,
  Paperclip as PaperclipIcon,
  Camera as CameraIcon,
  Image as ImageLucide,
  Video as VideoIcon,
  File as FileIcon,
  FileText as FileTextIcon,
  FileType,
  FileSpreadsheet,
  Presentation,
  Ellipsis,
  BellOff as BellOffIcon,
  ChevronRight as RightIcon,
  ChevronLeft as LeftIcon,
  X as CloseIcon,
  Search as SearchIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  MessagesSquare as MessagesIcon,
  UserPlus as UserPlusIcon,
  Link as LinkIcon,
  Info as InfoIcon,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

/** V7 uses the same 24px outline family throughout the product. */
function icon(Component: LucideIcon) {
  return function MessengerIcon(props: LucideProps) {
    return (
      <Component size={21} strokeWidth={1.7} aria-hidden="true" focusable="false" {...props} />
    );
  };
}
export const Plus = icon(PlusIcon);
export const Mic = icon(MicIcon);
export const Smile = icon(SmileIcon);
export const Send = icon(ArrowUp);
export const Pin = icon(PinIcon);
export const Reply = icon(ReplyIcon);
export const Copy = icon(CopyIcon);
export const SquarePen = icon(SquarePenIcon);
export const Trash2 = icon(TrashIcon);
export const Download = icon(DownloadIcon);
export const Paperclip = icon(PaperclipIcon);
export const Camera = icon(CameraIcon);
export const ImageIcon = icon(ImageLucide);
export const Video = icon(VideoIcon);
export const File = icon(FileIcon);
export const FilePdf = icon(FileTextIcon);
export const FileWord = icon(FileType);
export const FileExcel = icon(FileSpreadsheet);
export const FilePowerpoint = icon(Presentation);
export const FileText = icon(FileTextIcon);
export const MoreHorizontal = icon(Ellipsis);
export const BellOff = icon(BellOffIcon);
export const ChevronRight = icon(RightIcon);
export const ChevronLeft = icon(LeftIcon);
export const X = icon(CloseIcon);
export const Search = icon(SearchIcon);
export const Play = icon(PlayIcon);
export const Pause = icon(PauseIcon);
export const MessagesSquare = icon(MessagesIcon);
export const UserPlus = icon(UserPlusIcon);
export const Link2 = icon(LinkIcon);
export const Info = icon(InfoIcon);
export const NewMessage = icon(SquarePenIcon);
