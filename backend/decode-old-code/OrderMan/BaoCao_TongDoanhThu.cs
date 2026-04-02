using System;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class BaoCao_TongDoanhThu : Page
{
	protected Label lbLoi;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected Button tbTim;

	protected Label lbDauKy;

	protected Label lbPhanNo;

	protected Label lbPhanCo;

	protected Label lbChenhLech;

	protected Label lbCanDoi;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
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

	private void LoadBaoCaoTongDoanhThu()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			string[] array = tbTuNgay.Text.Trim().Split('/');
			if (array.Length == 3)
			{
				DateTime tuNgay = new DateTime(Convert.ToInt32(array[2]), Convert.ToInt32(array[1]), Convert.ToInt32(array[0]), 0, 0, 0);
				string[] array2 = tbDenNgay.Text.Trim().Split('/');
				if (array2.Length == 3)
				{
					DateTime denNgay = new DateTime(Convert.ToInt32(array2[2]), Convert.ToInt32(array2[1]), Convert.ToInt32(array2[0]), 23, 59, 59);
					DataSet dataSet = dBConnect.BaoCaoTongDoanhThu(tuNgay, denNgay);
					if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
					{
						DataRow dataRow = dataSet.Tables[0].Rows[0];
						lbDauKy.Text = Convert.ToDouble(dataRow["DauKy"]).ToString("N0");
						lbPhanNo.Text = Convert.ToDouble(dataRow["PhanNo"]).ToString("N0");
						lbPhanCo.Text = Convert.ToDouble(dataRow["PhanCo"]).ToString("N0");
						lbChenhLech.Text = Convert.ToDouble(dataRow["ChenhLech"]).ToString("N0");
						lbCanDoi.Text = Convert.ToDouble(dataRow["CanDoi"]).ToString("N0");
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
		LoadBaoCaoTongDoanhThu();
	}
}
