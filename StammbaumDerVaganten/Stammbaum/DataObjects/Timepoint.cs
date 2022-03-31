using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Timepoint : Referenceable<Timepoint>
    {
        [DataMember(Name = "_N")]
        public VersionedData<string> Name { get; set; } = new VersionedData<string>();

        [DataMember(Name = "_D")]
        public VersionedData<Date> Date { get; set; } = new VersionedData<Date>();

        public static Timepoint INVALID { get; } = new Timepoint { Reference = new Reference<Timepoint>(), Name = new VersionedData<string>("Custom"), Date = new VersionedData<Date>(new Date { Year = 1 }) };

        public Timepoint()
        { }

        public Timepoint(Database context, bool claimID)
            : base(context, claimID)
        { }

        public Timepoint(Database context, bool claimID, string name, Date date)
            : this(context, claimID)
        {
            Name.OverwriteLatestValue(name);
            Date.OverwriteLatestValue(date);
        }

        public override string ToString()
        {
            if (this == INVALID)
            {
                return "None";
            }

            return Name.Latest + " " + Date.Latest.Year; // + " [" + base.ToString() + "]";
        }
    }
}
