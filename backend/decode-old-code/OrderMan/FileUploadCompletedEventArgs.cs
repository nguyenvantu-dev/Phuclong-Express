namespace OrderMan;

public class FileUploadCompletedEventArgs
{
	public string FileName { get; set; }

	public string FilePath { get; set; }

	public FileUploadCompletedEventArgs()
	{
	}

	public FileUploadCompletedEventArgs(string fileName, string filePath)
	{
		FileName = fileName;
		FilePath = filePath;
	}
}
