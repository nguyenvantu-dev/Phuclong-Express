using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;
using OrderMan.Models;

namespace OrderMan;

public class BaoCao_TongCongNoTheoUser : Page
{
	protected Label lbLoi;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected DropDownList druser;

	protected Button tbTim;

	protected Button btExportToExcel;

	protected GridView gvCongNo;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataUser();
			KhoiTaoNgay();
		}
	}

	private void KhoiTaoNgay()
	{
		try
		{
			DateTime dateTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
			DateTime dateTime2 = dateTime.AddMonths(1).AddDays(-1.0);
			tbTuNgay.Text = dateTime.ToString("dd/MM/yyyy");
			tbDenNgay.Text = dateTime2.ToString("dd/MM/yyyy");
		}
		catch
		{
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			druser.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			druser.DataBind();
			druser.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	private void LoadBaoCaoTongCongNoTheoUser()
	{
		try
		{
			string[] array = tbTuNgay.Text.Trim().Split('/');
			if (array.Length == 3)
			{
				DateTime tuNgay = new DateTime(Convert.ToInt32(array[2]), Convert.ToInt32(array[1]), Convert.ToInt32(array[0]), 0, 0, 0);
				string[] array2 = tbDenNgay.Text.Trim().Split('/');
				if (array2.Length == 3)
				{
					DateTime denNgay = new DateTime(Convert.ToInt32(array2[2]), Convert.ToInt32(array2[1]), Convert.ToInt32(array2[0]), 23, 59, 59);
					DBConnect dBConnect = new DBConnect();
					DataSet dataSet = dBConnect.BaoCaoTongCongNoTheoUser(druser.SelectedItem.Value, tuNgay, denNgay);
					if (dataSet != null && dataSet.Tables.Count > 0)
					{
						gvCongNo.DataSource = dataSet.Tables[0];
						gvCongNo.DataBind();
					}
				}
				else
				{
					lbLoi.Text = "Thông tin đến ngày chưa đúng!!!";
				}
			}
			else
			{
				lbLoi.Text = "Thông tin từ ngày chưa đúng!!!";
			}
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadBaoCaoTongCongNoTheoUser();
	}

	protected void ExportToExcel()
	{
		base.Response.Clear();
		base.Response.Buffer = true;
		base.Response.AddHeader("content-disposition", "attachment;filename=DanhSachDatHang.xls");
		base.Response.Charset = "";
		base.Response.ContentType = "application/vnd.xlsx";
		StringWriter stringWriter = new StringWriter();
		HtmlTextWriter writer = new HtmlTextWriter(stringWriter);
		gvCongNo.RenderControl(writer);
		string input = Regex.Replace(stringWriter.ToString(), "(<img \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<input type=\"checkbox\"\\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<a \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		base.Response.Write(input.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	protected void btExportToExcel_Click(object sender, EventArgs e)
	{
		ExportToExcel();
	}

	public override void VerifyRenderingInServerForm(Control control)
	{
	}
}
