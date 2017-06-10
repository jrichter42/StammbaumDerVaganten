using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace StammbaumDerVaganten
{
    static class ListHelper
    {
        static bool manualCommit = false;
        public static void DataGrid_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            if (!manualCommit)
            {
                manualCommit = true;
                DataGrid grid = (DataGrid)sender;
                grid.CommitEdit(DataGridEditingUnit.Row, true);
                manualCommit = false;
            }
        }
    }
}
