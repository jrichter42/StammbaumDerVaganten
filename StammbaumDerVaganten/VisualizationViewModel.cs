using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Shapes;

namespace StammbaumDerVaganten
{
    public struct TreeNode
    {
        public Group Group;
        public List<Scout> Leader;
        public Date Founding;
    }

    public class VisualizationViewModel
    {

        public VisualizationViewModel()
        {

        }

        public void BuildTree(Database db)
        {

        }

        public void Draw(Canvas canvas)
        {
            UIElementCollection children = canvas.Children;
            Rectangle rect = new Rectangle();
            rect.set
            children.Add(new Rectangle)
        }
    }
}
