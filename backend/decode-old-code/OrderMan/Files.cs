using System;
using System.Drawing;
using System.IO;
using System.Web;

namespace OrderMan;

public class Files : IHttpHandler
{
	private HttpContext ctx;

	public bool IsReusable => false;

	public void ProcessRequest(HttpContext context)
	{
		try
		{
			HttpPostedFile httpPostedFile = context.Request.Files[0];
			string text = Guid.NewGuid().ToString();
			string extension = Path.GetExtension(httpPostedFile.FileName);
			ctx = context;
			string text2 = DateTime.Now.ToString("yyyyMM");
			string text3 = context.Server.MapPath("/imgLink").TrimEnd('\\') + "\\" + text2 + "\\";
			if (!Directory.Exists(text3))
			{
				Directory.CreateDirectory(text3);
			}
			httpPostedFile.SaveAs(text3 + text + extension);
			Image image = Image.FromFile(text3 + text + extension);
			Image image2 = Utils.ResizeImage(image, new Size(640, 480));
			image.Dispose();
			image2.Save(text3 + text + extension);
			context.Response.Write(text2 + "/" + text + extension);
		}
		catch (Exception ex)
		{
			throw ex;
		}
	}

	private void fileUpload_FileUploadCompleted(object sender, FileUploadCompletedEventArgs args)
	{
		string text = ctx.Request.QueryString["id"];
	}
}
