using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for BasicTimepointList.xaml
    /// </summary>
    public partial class BasicTimepointList : UserControl
    {
        public BasicTimepointList()
        {
            InitializeComponent();
        }

        private void pfadi_basic_timepointlist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = ((MainViewmodel)DataContext).CreateTimepoint();
        }

        private void pfadi_basic_timepointlist_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            ListHelper.DataGrid_CellEditEnding(sender, e);

            //Hack to make different levels of PropertyChanged update each other without resolving the actual issue
            if ((string)e.Column.Header == "Datum")
            {
                //pfadi_grouplist.ItemsSource = vm.Groups;
                //pfadi_basic_grouplist.ItemsSource = vm.Groups;
                //OnScoutSelectionChanged();
            }
        }
    }
}
