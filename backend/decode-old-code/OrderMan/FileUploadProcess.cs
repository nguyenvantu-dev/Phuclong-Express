using System;
using System.IO;
using System.Web;

namespace OrderMan;

public class FileUploadProcess
{
	public bool UniqueUserUpload { get; set; }

	public event FileUploadCompletedEvent FileUploadCompleted;

	public void ProcessRequest(HttpContext context, string uploadPath, string fileid)
	{
		HttpPostedFile httpPostedFile = context.Request.Files[0];
		string fileName = Path.GetFileName(httpPostedFile.FileName);
		string extension = Path.GetExtension(httpPostedFile.FileName);
		bool flag = string.IsNullOrEmpty(context.Request.QueryString["Complete"]) || bool.Parse(context.Request.QueryString["Complete"]);
		bool flag2 = !string.IsNullOrEmpty(context.Request.QueryString["GetBytes"]) && bool.Parse(context.Request.QueryString["GetBytes"]);
		long num = (string.IsNullOrEmpty(context.Request.QueryString["StartByte"]) ? 0 : long.Parse(context.Request.QueryString["StartByte"]));
		string text;
		if (UniqueUserUpload)
		{
			if (context.User.Identity.IsAuthenticated)
			{
				text = Path.Combine(uploadPath, string.Format("{0}_{1}", context.User.Identity.Name.Replace("\\", ""), fileName));
			}
			else
			{
				if (context.Session["fileUploadUser"] == null)
				{
					context.Session["fileUploadUser"] = Guid.NewGuid();
				}
				text = Path.Combine(uploadPath, string.Format("{0}_{1}", context.Session["fileUploadUser"], fileName));
			}
		}
		else
		{
			text = Path.Combine(uploadPath, fileid + extension);
		}
		if (flag2)
		{
			FileInfo fileInfo = new FileInfo(text);
			if (!fileInfo.Exists)
			{
				context.Response.Write("0");
			}
			else
			{
				context.Response.Write(fileInfo.Length.ToString());
			}
			context.Response.Flush();
			return;
		}
		if (num > 0 && File.Exists(text))
		{
			using FileStream fileStream = File.Open(text, FileMode.Append);
			SaveFile(context.Request.InputStream, fileStream);
			fileStream.Close();
		}
		else
		{
			using FileStream fileStream2 = File.Create(text);
			SaveFile(context.Request.InputStream, fileStream2);
			fileStream2.Close();
		}
		if (flag && this.FileUploadCompleted != null)
		{
			FileUploadCompletedEventArgs args = new FileUploadCompletedEventArgs(fileName, text);
			this.FileUploadCompleted(this, args);
		}
	}

	private void SaveFile(Stream stream, FileStream fs)
	{
		byte[] array = new byte[4096];
		int count;
		while ((count = stream.Read(array, 0, array.Length)) != 0)
		{
			fs.Write(array, 0, count);
		}
	}
}
