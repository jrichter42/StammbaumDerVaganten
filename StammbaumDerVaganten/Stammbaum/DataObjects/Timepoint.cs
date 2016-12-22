using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Timepoint : DataObject
    {
        public static int NEXT_ID = 1;

        protected override int GetNEXTID()
        {
            return NEXT_ID;
        }

        protected override void SetNEXTID(int id)
        {
            NEXT_ID = id;
        }

        #region Serialization
        [DataMember]
        public Date _D
        {
            get { return date; }
            set { date = value; }
        }

        [DataMember]
        public String _N
        {
            get { return name; }
            set { name = value; }
        }
        #endregion

        protected Date date = new Date();

        protected String name = new String();

        #region Accessors
        public Date Date
        {
            get { return date; }
            set { date = value; }
        }

        public String Name
        {
            get { return name; }
            set { name = value; }
        }
        #endregion

        /*protected static Timepoint invalid = new Timepoint { id = Timepoint.ID_INVALID, name = new String("Custom"), date = new Date { Year = 1 } };

        public static Timepoint INVALID
        {
            get { return invalid; }
        }*/

        public Timepoint() : base()
        {

        }

        public Timepoint(bool claimID) : base(claimID)
        {

        }

        public void ReassignID(int id)
        {
            ID = id;
        }

        public void AssignNewID()
        {
            ID = NEXT_ID++;
        }

        public override string ToString()
        {
            return name.Value + " " + date.Year + " [" + id.ToString() + "]";
        }
    }
}
