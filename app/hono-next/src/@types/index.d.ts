type CommonColumn = 'created_at' | 'created_by' | 'updated_at' | 'updated_by';

type DownloadFile = {
  file_id: string;
  filename: string;
  updated_at: Date;
};
